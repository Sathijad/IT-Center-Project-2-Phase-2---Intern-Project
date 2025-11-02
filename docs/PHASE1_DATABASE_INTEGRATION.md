# Phase 1 Database Integration Guide

This guide explains how to use the **existing Phase 1 database** with Phase 2, avoiding duplicate containers and maintaining data continuity.

---

## 🎯 Why Use Phase 1 Database?

- ✅ **Data Continuity**: Keep existing user data, authentication records, etc.
- ✅ **No Duplication**: Single source of truth for all IT Center data
- ✅ **Easier Management**: One database container to manage
- ✅ **Migration Continuity**: Phase 2 migrations (V2__...) continue from Phase 1

---

## 📋 Prerequisites

1. **Phase 1 database container must exist and be named `itcenter_pg`**
2. **Database name**: `itcenter_auth`
3. **Database credentials**:
   - User: `itcenter`
   - Password: `password`
   - Port: `5432`

---

## 🔍 Step 1: Verify Phase 1 Database

### Check if Phase 1 DB Container Exists

```bash
# List all containers (including stopped)
docker ps -a --filter "name=itcenter_pg"
```

### Expected Output
```
CONTAINER ID   IMAGE                COMMAND                  STATUS
abc123def456   postgres:15-alpine   "docker-entrypoint.sh"   Up 2 hours (or Exited)
```

### Start Phase 1 Database (if stopped)

```bash
# Start the existing container
docker start itcenter_pg

# Verify it's running
docker ps --filter "name=itcenter_pg"
```

### Verify Database Connectivity

```bash
# Test connection from host
docker exec -it itcenter_pg psql -U itcenter -d itcenter_auth -c "SELECT version();"
```

---

## ⚙️ Step 2: Configure Phase 2 to Use Phase 1 DB

### Option A: Backend Runs on Host (Recommended for Development)

When running the backend with `npm run dev` directly on your machine:

**Environment Variables** (in `leave-attendance-api/.env`):

```env
# Database - connects to Phase 1 container via published port
DB_HOST=localhost
DB_PORT=5432
DB_NAME=itcenter_auth
DB_USER=itcenter
DB_PASSWORD=password
```

The Phase 1 container should already have port `5432:5432` published, so `localhost:5432` works directly.

---

### Option B: Backend Runs in Docker

If Phase 2 backend runs in Docker (compose), use one of these patterns:

#### Pattern B1: Use `host.docker.internal`

**Environment Variables**:

```env
# Database - connects via host's published port
DB_HOST=host.docker.internal  # Windows/Mac
# OR
DB_HOST=172.17.0.1            # Linux (Docker default bridge IP)
DB_PORT=5432
DB_NAME=itcenter_auth
DB_USER=itcenter
DB_PASSWORD=password
```

**docker-compose.yml** (Phase 2 backend):

```yaml
services:
  backend:
    environment:
      - DB_HOST=host.docker.internal
      - DB_PORT=5432
      - DB_NAME=itcenter_auth
      - DB_USER=itcenter
      - DB_PASSWORD=password
    extra_hosts:
      - "host.docker.internal:host-gateway"  # Required for Linux
```

---

#### Pattern B2: Use Same Docker Network

**Step 1**: Find Phase 1 database network

```powershell
# PowerShell: Find network
docker inspect itcenter_pg | Select-String "NetworkMode"
# OR
docker network ls
```

**Step 2**: Connect Phase 2 backend to same network

**docker-compose.yml** (Phase 2 backend):

```yaml
networks:
  itcenter_net:
    external: true

services:
  backend:
    networks:
      - itcenter_net
    environment:
      - DB_HOST=itcenter_pg  # Container name as hostname
      - DB_PORT=5432
      - DB_NAME=itcenter_auth
      - DB_USER=itcenter
      - DB_PASSWORD=password
```

**Step 3**: Connect Phase 1 DB to network (if not already)

```bash
# Find network name (e.g., itcenter_default)
docker network ls

# Connect Phase 1 DB to Phase 2 network
docker network connect <network_name> itcenter_pg
```

---

## 🚫 Step 3: Disable Phase 2 Database Service

The `docker-compose.db.yml` file is **already configured** to skip creating a duplicate database.

**What's disabled:**
- `itcenter_pg` service is commented out
- Database volume is commented out

**What's enabled:**
- `pgadmin` service (optional, for database management)

### To start pgAdmin only:

```bash
docker compose -f infra/docker/docker-compose.db.yml up -d pgadmin
```

**Access pgAdmin:**
- URL: http://localhost:5050
- Email: `admin@itcenter.local`
- Password: `admin`

**Connect to Phase 1 DB in pgAdmin:**
1. Right-click "Servers" → "Create" → "Server"
2. General tab:
   - Name: `ITCenter Phase 1 DB`
3. Connection tab:
   - Host: `itcenter_pg` (if pgAdmin on same network) or `host.docker.internal`
   - Port: `5432`
   - Database: `itcenter_auth`
   - Username: `itcenter`
   - Password: `password`

---

## 📊 Step 4: Verify Migration Versions

**Critical**: Ensure Phase 2 migrations continue from Phase 1.

**Check Phase 1 migration versions:**

```bash
docker exec -it itcenter_pg psql -U itcenter -d itcenter_auth -c "
  SELECT version, description, installed_on 
  FROM flyway_schema_history 
  ORDER BY installed_rank DESC 
  LIMIT 5;
"
```

**Expected**: Phase 1 should end at something like `V1__...` or `V5__...`

**Phase 2 migrations start at**: `V2__leave_attendance.sql` ✅

If there's a conflict, you'll need to:
1. Rename Phase 2 migrations to continue from Phase 1's highest version
2. Or set baseline: `flyway.baseline-on-migrate=true` (if using Flyway)

---

## 🗄️ Step 5: Run Phase 2 Migrations

**Important**: Migrations run against the same `itcenter_auth` database.

```bash
cd leave-attendance-api

# Ensure .env is configured with Phase 1 DB connection
# (see Step 2 above)

# Run migrations
npm run migrate:up

# Verify tables created
docker exec -it itcenter_pg psql -U itcenter -d itcenter_auth -c "\dt"
```

**Expected Phase 2 tables:**
- `leave_policies`
- `leave_requests`
- `leave_balances`
- `attendance_logs`
- `idempotency_keys`
- etc.

---

## ✅ Step 6: Verify Setup

### Test Backend Connection

```bash
cd leave-attendance-api
npm run dev
```

**Check logs** for:
```
Database connection established
Server started { port: 8082, nodeEnv: 'development' }
```

### Test Health Endpoint

```bash
curl http://localhost:8082/healthz
# Should return: {"status":"healthy","service":"leave-attendance-api"}
```

### Verify Database Schema

```bash
docker exec -it itcenter_pg psql -U itcenter -d itcenter_auth -c "
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name;
"
```

Should show both Phase 1 and Phase 2 tables.

---

## 🔧 Troubleshooting

### Issue: "Container name already in use"

**Error:**
```
Error response from daemon: Conflict. The container name "itcenter_pg" is already in use.
```

**Solution:**
- The docker-compose file should already have `itcenter_pg` commented out
- If not, ensure you're using the updated `docker-compose.db.yml`

### Issue: "Connection refused" to database

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

1. **Check Phase 1 DB is running:**
   ```bash
   docker ps --filter "name=itcenter_pg"
   docker start itcenter_pg  # if stopped
   ```

2. **Check port is published:**
   ```bash
   docker port itcenter_pg
   # Should show: 5432/tcp -> 0.0.0.0:5432
   ```

3. **Test connection:**
   ```bash
   docker exec -it itcenter_pg psql -U itcenter -d itcenter_auth -c "SELECT 1;"
   ```

4. **For Docker-to-Docker connections:**
   - Use `host.docker.internal` (Windows/Mac) or container name on shared network (Linux)

### Issue: "Database does not exist"

**Error:**
```
FATAL: database "itcenter_auth" does not exist
```

**Solution:**
- Verify Phase 1 database name matches
- Check: `docker exec -it itcenter_pg psql -U itcenter -l`

### Issue: Migration version conflict

**Error:**
```
Migration checksum mismatch
```

**Solution:**
1. Check Phase 1 migration versions
2. Rename Phase 2 migrations to continue sequence
3. Or use baseline migration strategy

---

## 📝 Summary

**Quick Setup Checklist:**

- [ ] Phase 1 DB container exists and is running (`docker ps --filter "name=itcenter_pg"`)
- [ ] Phase 2 `.env` configured with Phase 1 DB connection details
- [ ] `docker-compose.db.yml` has DB service commented out (already done)
- [ ] Phase 2 migrations versioned correctly (V2__...)
- [ ] Migrations run successfully
- [ ] Backend connects to Phase 1 DB
- [ ] Health check passes

**Connection Details Reference:**

```
Host: localhost (or host.docker.internal for Docker-to-Docker)
Port: 5432
Database: itcenter_auth
Username: itcenter
Password: password
```

---

## 🚀 Next Steps

After successful integration:

1. ✅ Run Phase 2 migrations: `npm run migrate:up`
2. ✅ Seed Phase 2 data: `npm run seed`
3. ✅ Start backend: `npm run dev`
4. ✅ Test API endpoints
5. ✅ Verify data persists in Phase 1 database

**Happy coding!** 🎉


# Phase 1 Database Setup - Quick Reference

**TL;DR**: Phase 2 uses the **same database** from Phase 1. No need to create a new one!

---

## ✅ What You Need to Do

### Step 1: Check Phase 1 Database

```bash
# Check if Phase 1 database container exists
docker ps -a --filter "name=itcenter_pg"
```

### Step 2: Start Phase 1 Database (if stopped)

```bash
# Start the existing container
docker start itcenter_pg

# Verify it's running
docker ps --filter "name=itcenter_pg"
```

### Step 3: Configure Phase 2 Backend

Create `leave-attendance-api/.env` with:

```env
# Database - connects to Phase 1 container
DB_HOST=localhost
DB_PORT=5432
DB_NAME=itcenter_auth
DB_USER=itcenter
DB_PASSWORD=password
```

### Step 4: Run Phase 2 Migrations

```bash
cd leave-attendance-api
npm run migrate:up
npm run seed
npm run dev
```

---

## 🎯 That's It!

Phase 2 will now use the same database as Phase 1. All your Phase 1 data is preserved.

---

## 📖 Need More Details?

- **Full Guide**: [docs/PHASE1_DATABASE_INTEGRATION.md](docs/PHASE1_DATABASE_INTEGRATION.md)
- **Environment Setup**: [leave-attendance-api/ENV_SETUP.md](leave-attendance-api/ENV_SETUP.md)
- **Quick Setup**: [QUICK_SETUP_GUIDE.md](QUICK_SETUP_GUIDE.md)

---

## ⚠️ Common Issues

### "Container name already in use"
✅ **Already fixed!** The docker-compose file is configured to skip creating a duplicate DB.

### "Cannot connect to database"
- Ensure Phase 1 DB is running: `docker start itcenter_pg`
- Check port 5432 is published: `docker port itcenter_pg`

### "Database does not exist"
- Verify database name matches Phase 1: `itcenter_auth`
- Check credentials: `itcenter` / `password`

---

**For troubleshooting, see**: [docs/PHASE1_DATABASE_INTEGRATION.md#troubleshooting](docs/PHASE1_DATABASE_INTEGRATION.md#-troubleshooting)


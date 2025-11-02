# 🚀 Quick Setup Guide - Phase 2

Complete Phase 2 setup in **under 10 minutes**!

---

## Step 1: Prerequisites (2 minutes)

### Install Required Software

**Windows**:
```powershell
# Install Node.js 18+ from nodejs.org
# Install Docker Desktop from docker.com

# Verify installation
node --version    # Should show v18 or higher
npm --version     # Should show v9 or higher
docker --version  # Should show Docker Desktop
```

**macOS**:
```bash
# Using Homebrew
brew install node@18
brew install docker

# Verify
node --version
npm --version
docker --version
```

**Linux** (Ubuntu/Debian):
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify
node --version
npm --version
docker --version
```

---

## Step 2: Start Database (1 minute)

### Option A: Using Existing Phase 1 Database (Recommended)

```bash
# Navigate to project root
cd "C:\Users\SathijaDeshapriya\Downloads\IT Center Project 2 Phase 2"

# Check if Phase 1 database container exists
docker ps -a --filter "name=itcenter_pg"

# If container exists but is stopped, start it:
docker start itcenter_pg

# Verify it's running
docker ps --filter "name=itcenter_pg"

# Test database connection
docker exec -it itcenter_pg psql -U itcenter -d itcenter_auth -c "SELECT version();"
```

**✅ Phase 2 is configured to use Phase 1 database automatically!**

The `docker-compose.db.yml` is already configured to skip creating a duplicate database.
You can optionally start pgAdmin for database management:

```bash
# Start pgAdmin only (database already exists)
docker compose -f infra/docker/docker-compose.db.yml up -d pgadmin

# Access pgAdmin: http://localhost:5050
# Email: admin@itcenter.local
# Password: admin
```

**📖 For detailed Phase 1 DB integration, see:** [Phase 1 Database Integration Guide](docs/PHASE1_DATABASE_INTEGRATION.md)

---

### Option B: Create New Database (Only if Phase 1 doesn't exist)

**⚠️ Only use this if you don't have Phase 1 database!**

```bash
# Use standalone compose file to create new database
docker compose -f infra/docker/docker-compose.db.yml.standalone up -d

# Verify containers are running
docker ps

# Access pgAdmin: http://localhost:5050
# Email: admin@itcenter.local
# Password: admin
```

---

## Step 3: Setup Backend (3 minutes)

```bash
# Navigate to backend directory
cd leave-attendance-api

# Install dependencies
npm install

# Run migrations
npm run migrate:up

# Seed initial data
npm run seed

# Start development server
npm run dev

# Backend should now be running at http://localhost:8082
```

**Verify backend**:
```bash
curl http://localhost:8082/healthz
# Should return: {"status":"healthy","service":"leave-attendance-api"}
```

---

## Step 4: Setup Frontend (2 minutes)

**New Terminal Window:**

```bash
# Navigate to frontend directory
cd admin-web-react

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend should now be running at http://localhost:5173
```

**Open browser**:
- Visit: http://localhost:5173
- Login with mock credentials (any email/password)

---

## Step 5: Test the System (2 minutes)

### Backend Tests
```bash
# In leave-attendance-api directory
npm run test:unit
npm run test:api
```

### Frontend Tests
```bash
# In admin-web-react directory
npm test
```

---

## Step 6: Access the Application

### Web Application
**URL**: http://localhost:5173

**Mock Login**:
- Email: any email (e.g., `employee@itcenter.local`)
- Password: any password

**Features to Test**:
1. View leave balances
2. Apply for leave
3. View attendance logs
4. Clock in/out (if employee)

### API Documentation
**URL**: http://localhost:8082/openapi/leave.v1.yaml

Use **Postman** or **curl** to test:
```bash
# Health check
curl http://localhost:8082/healthz

# Get leave balance (requires token)
curl http://localhost:8082/api/v1/leave/balance?user_id=123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Admin
**URL**: http://localhost:5050

**Credentials**:
- Email: `admin@itcenter.local`
- Password: `admin`

**Connect to database**:
- Host: `itcenter_pg`
- Port: `5432`
- Database: `itcenter_auth`
- Username: `itcenter`
- Password: `password`

---

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution**:
```bash
# Check if Phase 1 database container is running
docker ps --filter "name=itcenter_pg"

# If container exists but stopped, start it:
docker start itcenter_pg

# If container doesn't exist, check Phase 1 project or use standalone:
# docker compose -f infra/docker/docker-compose.db.yml.standalone up -d

# Verify database is healthy
docker logs itcenter_pg

# Test connection
docker exec -it itcenter_pg psql -U itcenter -d itcenter_auth -c "SELECT 1;"
```

**For Phase 1 DB integration issues, see:** [Phase 1 Database Integration Guide](docs/PHASE1_DATABASE_INTEGRATION.md)

### Issue: "Port already in use"
**Solution**:
```bash
# Backend (port 8082)
# Change PORT in .env file

# Frontend (port 5173)
# Change port in vite.config.ts

# Database (port 5432)
# Change port mapping in docker-compose.yml
```

### Issue: "Module not found"
**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Migration failed"
**Solution**:
```bash
# Check Phase 1 database is running
docker ps --filter "name=itcenter_pg"
docker start itcenter_pg  # if stopped

# Verify database connection in .env file
# Ensure DB_HOST=localhost (or host.docker.internal for Docker)

# Run migrations again
npm run migrate:up
npm run seed

# If using Phase 1 DB, check migration version conflicts
# See: docs/PHASE1_DATABASE_INTEGRATION.md
```

---

## Quick Commands Reference

### Backend
```bash
cd leave-attendance-api

# Development
npm run dev              # Start dev server

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:api         # API tests only

# Database
npm run migrate:up       # Run migrations
npm run migrate:down     # Rollback migrations
npm run seed             # Seed data

# Build
npm run build            # Production build
npm run lint             # Lint code
```

### Frontend
```bash
cd admin-web-react

# Development
npm run dev              # Start dev server

# Testing
npm test                 # Run tests
npm run test:coverage    # With coverage

# Build
npm run build            # Production build
npm run preview          # Preview build
npm run lint             # Lint code
```

### Database
```bash
# Start
docker compose -f infra/docker/docker-compose.db.yml up -d

# Stop
docker compose -f infra/docker/docker-compose.db.yml down

# Logs
docker logs itcenter_pg
docker logs itcenter_pgadmin

# Reset
docker compose -f infra/docker/docker-compose.db.yml down -v
docker compose -f infra/docker/docker-compose.db.yml up -d
```

---

## Next Steps

1. ✅ **You're all set!** The system is running.

2. 📚 **Explore**:
   - Read [Architecture Docs](docs/ARCHITECTURE.md)
   - Try [API endpoints](docs/API_GUIDE.md)
   - Check [component docs](admin-web-react/README.md)

3. 🧪 **Test**:
   - Create a leave request
   - Approve/reject leave
   - Clock in/out
   - View reports

4. 🚀 **Deploy**:
   - Read [Deployment Guide](DEPLOYMENT_CHECKLIST.md)
   - Run [CI/CD pipeline](.github/workflows/phase2-ci.yml)
   - Deploy to AWS

---

## Need Help?

- 📖 Check documentation in `/docs`
- 🔍 Review error logs in console
- 💬 Contact development team

**Happy Coding!** 🎉


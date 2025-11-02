# Environment Variables Setup

Create a `.env` file in the `leave-attendance-api/` directory with the following variables:

## 📋 Phase 1 Database Integration

**⚠️ Important**: Phase 2 is configured to use the **existing Phase 1 database**.

**Before configuring**: Ensure Phase 1 database container is running:
```bash
docker ps --filter "name=itcenter_pg"
# If stopped: docker start itcenter_pg
```

**Connection Details** (same as Phase 1):
- Database container: `itcenter_pg` (from Phase 1)
- Database name: `itcenter_auth`
- Port: `5432` (published from Phase 1 container)

**For detailed integration guide**: See [Phase 1 Database Integration Guide](../../docs/PHASE1_DATABASE_INTEGRATION.md)

---

## Required Variables

```env
# Application
NODE_ENV=development
PORT=8082
API_VERSION=v1

# Database - Phase 1 Database Connection
# These settings connect to the existing Phase 1 database container
DB_HOST=localhost          # Use 'localhost' if backend runs on host (recommended)
                            # Use 'host.docker.internal' if backend runs in Docker (Windows/Mac)
                            # Use container name 'itcenter_pg' if on same Docker network (Linux)
DB_PORT=5432                # Port published by Phase 1 container
DB_NAME=itcenter_auth      # Same database as Phase 1
DB_USER=itcenter           # Same credentials as Phase 1
DB_PASSWORD=password        # Same credentials as Phase 1
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=5000

# AWS Cognito
COGNITO_REGION=ap-southeast-2
COGNITO_USER_POOL_ID=ap-southeast-2_hTAYJId8y
COGNITO_AUDIENCE=3rdnl5ind8guti89jrbob85r4i
COGNITO_ISSUER=https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_hTAYJId8y
COGNITO_DOMAIN=itcenter-auth.auth.ap-southeast-2.amazoncognito.com
JWKS_CACHE_TTL=600

# Feature Flags
ENABLE_GEO_VALIDATION=false
ENABLE_CALENDAR_SYNC=true
ENABLE_IDEMPOTENCY=true

# Microsoft Graph (for calendar sync)
MSGRAPH_TENANT_ID=your-tenant-id
MSGRAPH_CLIENT_ID=your-client-id
MSGRAPH_CLIENT_SECRET=your-client-secret
MSGRAPH_SCOPE=https://graph.microsoft.com/.default

# AWS SES (for email notifications)
AWS_REGION=ap-southeast-2
SES_FROM_EMAIL=noreply@itcenter.local
SES_REPLY_TO=hr@itcenter.local

# Geofencing
GEO_OFFICE_LAT=-33.8688
GEO_OFFICE_LNG=151.2093
GEO_RADIUS_METERS=500

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Idempotency
IDEMPOTENCY_TTL_HOURS=24
```

## Quick Setup

```bash
cd leave-attendance-api

# Copy this content and create .env file
cat > .env << 'EOF'
NODE_ENV=development
PORT=8082
DB_HOST=localhost
DB_PORT=5432
DB_NAME=itcenter_auth
DB_USER=itcenter
DB_PASSWORD=password
COGNITO_REGION=ap-southeast-2
COGNITO_USER_POOL_ID=ap-southeast-2_hTAYJId8y
COGNITO_AUDIENCE=3rdnl5ind8guti89jrbob85r4i
COGNITO_ISSUER=https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_hTAYJId8y
ENABLE_GEO_VALIDATION=false
ENABLE_CALENDAR_SYNC=true
CORS_ORIGIN=http://localhost:5173
EOF
```

## 🔧 Database Connection Options

### Option 1: Backend on Host (Recommended for Development)

When running `npm run dev` directly on your machine:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=itcenter_auth
DB_USER=itcenter
DB_PASSWORD=password
```

### Option 2: Backend in Docker (Docker Compose)

If Phase 2 backend runs in Docker, connect via host:

**Windows/Mac:**
```env
DB_HOST=host.docker.internal
DB_PORT=5432
DB_NAME=itcenter_auth
DB_USER=itcenter
DB_PASSWORD=password
```

**Linux:**
```env
DB_HOST=172.17.0.1  # Or use container name if on same network
DB_PORT=5432
DB_NAME=itcenter_auth
DB_USER=itcenter
DB_PASSWORD=password
```

### Option 3: Backend on Same Docker Network

If Phase 2 backend is on the same Docker network as Phase 1 DB:

```env
DB_HOST=itcenter_pg  # Container name
DB_PORT=5432
DB_NAME=itcenter_auth
DB_USER=itcenter
DB_PASSWORD=password
```

**Setup shared network:**
```powershell
# PowerShell: Find Phase 1 DB network
docker inspect itcenter_pg | Select-String "NetworkMode"

# Connect Phase 2 backend to same network
# (add to docker-compose.yml networks section)
```

---

## ✅ Verify Database Connection

After setting up `.env`, test the connection:

```bash
cd leave-attendance-api

# Start backend
npm run dev

# Look for this in logs:
# "Database connection established"
# "Server started { port: 8082 }"

# Test health endpoint
curl http://localhost:8082/healthz
```

**Troubleshooting**: See [Phase 1 Database Integration Guide](../../docs/PHASE1_DATABASE_INTEGRATION.md#troubleshooting)

---

## Production

For production, use AWS Secrets Manager or environment variables set in your deployment platform.


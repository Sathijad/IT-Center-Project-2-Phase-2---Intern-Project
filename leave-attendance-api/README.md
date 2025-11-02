# Leave & Attendance API - Phase 2

Staff Leave & Attendance Management API for IT Center Intern Project Phase 2.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express + TypeScript
- **Database**: PostgreSQL 15
- **Authentication**: AWS Cognito (JWT)
- **Deployment**: AWS Lambda + API Gateway
- **Testing**: Jest, Supertest, k6

## Features

- Leave request management (apply, approve, reject, cancel)
- Leave balance tracking with policy enforcement
- Attendance clock-in/out with optional geofencing
- Microsoft Graph calendar sync
- Email notifications via AWS SES
- Audit trail for all leave actions
- Idempotency support for critical operations

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Docker & Docker Compose (for local PostgreSQL)
- AWS account with Cognito configured

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

### Database Setup

**Using Phase 1 Database (Recommended):**

```bash
# Start Phase 1 database container (if stopped)
docker start itcenter_pg

# Verify database is running
docker ps --filter "name=itcenter_pg"

# Configure .env file (see ENV_SETUP.md)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=itcenter_auth
# DB_USER=itcenter
# DB_PASSWORD=password

# Run migrations
npm run migrate:up

# Seed initial data
npm run seed
```

**Creating New Database (Only if Phase 1 doesn't exist):**

```bash
# Start PostgreSQL and pgAdmin
docker compose -f ../infra/docker/docker-compose.db.yml.standalone up -d

# Run migrations
npm run migrate:up

# Seed initial data
npm run seed
```

📖 **See**: [ENV_SETUP.md](ENV_SETUP.md) for Phase 1 database connection details

### Development

```bash
# Run in development mode with hot reload
npm run dev

# API will be available at http://localhost:8082
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run API integration tests
npm run test:api

# Run performance tests
npm run k6
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to AWS (via Terraform)
cd ../infra/terraform/leave-attendance
terraform init
terraform plan -var="environment=dev"
terraform apply -var="environment=dev"
```

## API Documentation

OpenAPI specification available at `/openapi/leave.v1.yaml`

### Key Endpoints

- `GET /api/v1/leave/balance` - Get leave balances
- `POST /api/v1/leave/requests` - Create leave request
- `PATCH /api/v1/leave/requests/:id` - Approve/reject leave
- `POST /api/v1/attendance/clock-in` - Clock in
- `POST /api/v1/attendance/clock-out` - Clock out
- `GET /healthz` - Health check
- `GET /readyz` - Readiness check

## Project Structure

```
leave-attendance-api/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── repositories/     # Data access
│   ├── middleware/       # Auth, RBAC, logging
│   ├── lib/              # Utilities (DB, logger)
│   ├── routes/           # Express routes
│   ├── types/            # TypeScript types
│   ├── utils/            # Helper functions
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── migrations/           # SQL migrations
├── openapi/              # OpenAPI specs
├── tests/                # Test suites
├── scripts/              # Utility scripts
└── package.json
```

## Environment Variables

See `.env.example` for all available configuration options.

## RBAC

- **ADMIN**: Full access (approve/reject, view all, manage policies, reports)
- **EMPLOYEE**: Own data only (view balances, apply leave, clock in/out)

## License

MIT


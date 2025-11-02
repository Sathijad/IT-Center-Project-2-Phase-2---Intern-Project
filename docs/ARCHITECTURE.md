# Architecture Documentation

## Phase 2: Leave & Attendance Management System

### System Overview

The Leave & Attendance Management System is a Node.js-based microservice that extends the Phase 1 authentication infrastructure. It provides comprehensive leave application, approval, and attendance tracking capabilities with integrations to external services.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├─────────────────┬─────────────────────────┬─────────────────────┤
│  React Web App  │  Flutter Mobile App     │  Postman/API Tools  │
│  (Admin/Employee)│  (Employee)            │                     │
└────────┬────────┴────────────┬────────────┴──────────┬──────────┘
         │                     │                       │
         └─────────────────────┼───────────────────────┘
                               │ HTTPS + JWT
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway / Lambda                        │
│  (AWS API Gateway + Lambda Functions)                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express Application (Node.js + TypeScript)              │   │
│  │                                                           │   │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────┐           │   │
│  │  │  Auth   │  │   RBAC   │  │ Idempotency  │           │   │
│  │  │Middleware│  │Middleware│  │  Middleware  │           │   │
│  │  └────┬────┘  └────┬─────┘  └──────┬───────┘           │   │
│  │       └────────────┼────────────────┘                   │   │
│  │                    ▼                                     │   │
│  │  ┌────────────────────────────────────────────┐         │   │
│  │  │         Controllers Layer                   │         │   │
│  │  │  ┌──────────────┐  ┌────────────────────┐ │         │   │
│  │  │  │ Leave        │  │ Attendance         │ │         │   │
│  │  │  │ Controller   │  │ Controller         │ │         │   │
│  │  │  └──────┬───────┘  └─────────┬──────────┘ │         │   │
│  │  │         │                     │            │         │   │
│  │  │  ┌──────┴─────────────────────┴───────┐   │         │   │
│  │  │  │         Services Layer              │   │         │   │
│  │  │  │  ┌──────────┐  ┌──────────────┐   │   │         │   │
│  │  │  │  │ Policy   │  │ Balance      │   │   │         │   │
│  │  │  │  │ Service  │  │ Service      │   │   │         │   │
│  │  │  │  └────┬─────┘  └──────┬───────┘   │   │         │   │
│  │  │  │       │                │           │   │         │   │
│  │  │  │  ┌────┴────────────────┴─────┐    │   │         │   │
│  │  │  │  │   Repository Layer         │    │   │         │   │
│  │  │  │  │   (Data Access)            │    │   │         │   │
│  │  │  │  └──────────┬─────────────────┘    │   │         │   │
│  │  └──┼─────────────┼───────────────────────┼───┘         │   │
│  └─────┼─────────────┼───────────────────────┼─────────────┘   │
└────────┼─────────────┼───────────────────────┼─────────────────┘
         │             │                       │
         ▼             ▼                       ▼
┌────────────┐  ┌──────────────┐  ┌──────────────────────────┐
│ PostgreSQL │  │ AWS Cognito  │  │ External Integrations    │
│ Database   │  │ (JWT Auth)   │  ├──────────────────────────┤
│ Phase 1    │  │              │  │ - Microsoft Graph        │
│ Schema +   │  │              │  │ - AWS SES                │
│ Phase 2    │  │              │  │ - Geofencing API         │
│ Tables     │  │              │  └──────────────────────────┘
└────────────┘  └──────────────┘
```

### Component Breakdown

#### 1. Client Layer

- **React Web App**: Admin dashboard for leave approvals, policies, reports, and attendance management
- **Flutter Mobile App**: Employee-facing app for leave applications and clock-in/out
- **API Tools**: Postman collections, curl scripts for testing

#### 2. API Layer

**Express Application Structure**:
- **Middleware Stack**:
  - Correlation ID tracking for distributed tracing
  - JWT authentication via AWS Cognito
  - Role-based access control (ADMIN, EMPLOYEE)
  - Idempotency handling for POST requests
  - Request logging and monitoring

- **Controllers**:
  - `LeaveController`: Leave request management
  - `AttendanceController`: Clock-in/out operations
  - `IntegrationsController`: External service syncs
  - `ReportsController`: Administrative reports

- **Services**:
  - `PolicyService`: Leave policy validation and business rules
  - `BalanceService`: Balance calculations and deductions
  - `AttendanceService`: Clock-in/out logic
  - `GeoService`: Geofencing validation
  - `MsGraphService`: Calendar synchronization
  - `SesService`: Email notifications

- **Repositories**:
  - `LeaveRepository`: Data access for leave operations
  - `AttendanceRepository`: Data access for attendance
  - `IdempotencyRepository`: Idempotency key management

#### 3. Data Layer

**PostgreSQL Database (Shared with Phase 1)**:
- **Phase 1 Tables** (Existing):
  - `app_users`: User accounts
  - `roles`: User roles
  - `sessions`: Session management

- **Phase 2 Tables** (New):
  - `leave_policies`: Policy definitions
  - `leave_requests`: Request records
  - `leave_balances`: User balances
  - `leave_audit`: Audit trail
  - `attendance_logs`: Clock-in/out records
  - `idempotency_keys`: Idempotency storage
  - `public_holidays`: Holiday calendar

**Database Constraints**:
- Unique constraint to prevent overlapping leave requests
- Foreign keys to maintain referential integrity
- Check constraints for valid status transitions
- Indexes for performance optimization

#### 4. Authentication & Authorization

**AWS Cognito Integration**:
- JWT token validation via JWKS
- Caching of JWKS keys (10-minute TTL)
- Clock skew tolerance (±5 minutes)
- Role extraction from `cognito:groups`

**RBAC Implementation**:
- **ADMIN**: Full access to all endpoints, approvals, reports
- **EMPLOYEE**: Own data only (balances, requests, attendance)
- Server-side enforcement in middleware
- Data scoping to prevent cross-user access

#### 5. External Integrations

**Microsoft Graph**:
- Calendar synchronization for approved leaves
- OAuth2 client credentials flow
- Rate limit handling with exponential backoff
- Stub implementation ready for production

**AWS SES**:
- Email notifications for leave events
- HTML email templates
- Async sending to avoid blocking requests

**Geofencing**:
- Distance calculation using Haversine formula
- Configurable office location and radius
- Optional validation via feature flag

#### 6. Infrastructure

**Local Development**:
- Docker Compose for PostgreSQL + pgAdmin
- Hot-reload with tsx
- Environment-based configuration

**AWS Deployment**:
- API Gateway for request routing
- Lambda functions for compute
- SQS for async calendar sync jobs
- CloudWatch for logging and monitoring
- Terraform for infrastructure as code

### Data Flow

#### Leave Request Flow

1. **Employee submits request**:
   - POST `/api/v1/leave/requests` with idempotency key
   - Validate policy, balance, dates, overlaps
   - Create record in `leave_requests`
   - Create audit log entry
   - Send email notification (async)
   - Return created request

2. **Admin approves/rejects**:
   - PATCH `/api/v1/leave/requests/:id` with status
   - Update request status
   - Create audit log entry
   - If approved:
     - Deduct balance
     - Trigger calendar sync (async)
   - Send email notification (async)

3. **Calendar sync**:
   - Read from SQS queue (async)
   - Create calendar block via Microsoft Graph
   - Handle rate limits and retries

#### Attendance Flow

1. **Clock In**:
   - POST `/api/v1/attendance/clock-in` with idempotency key
   - Validate geolocation (if enabled)
   - Check for existing clock-in today
   - Create record in `attendance_logs`
   - Return clock-in record

2. **Clock Out**:
   - POST `/api/v1/attendance/clock-out`
   - Find today's clock-in
   - Calculate duration in minutes
   - Update record with clock-out and duration
   - Return success

### Security Considerations

1. **Authentication**:
   - JWT validation on every request
   - JWKS caching for performance
   - Token expiration checking

2. **Authorization**:
   - Role-based access control
   - Data scoping to prevent cross-user access
   - Admin-only endpoints protected

3. **Input Validation**:
   - Zod/Joi for request validation (planned)
   - SQL injection prevention via parameterized queries
   - Date range validation

4. **Data Protection**:
   - PII masking in production logs
   - Encrypted database connections
   - Secrets via environment variables

5. **Idempotency**:
   - Prevents duplicate requests
   - 24-hour key retention
   - Automatic cleanup

### Performance Optimizations

1. **Database**:
   - Connection pooling (max 20 connections)
   - Indexes on frequently queried columns
   - Pagination for large result sets
   - Avoid N+1 queries

2. **Caching**:
   - JWKS key caching (10 minutes)
   - Idempotency key storage (in-memory + DB)

3. **Async Operations**:
   - Email sending
   - Calendar synchronization
   - Audit logging

### Monitoring & Observability

1. **Logging**:
   - Structured JSON logs via Winston
   - Correlation ID tracking
   - PII masking in production
   - Log levels (debug, info, warn, error)

2. **Metrics** (Planned):
   - Request latency (p50, p95, p99)
   - Error rates (4xx, 5xx)
   - Business metrics (requests/day, approval rate)

3. **Health Checks**:
   - `/healthz`: Simple health check
   - `/readyz`: Database and JWKS connectivity

4. **Distributed Tracing** (Planned):
   - AWS X-Ray integration
   - Request correlation IDs
   - Service map generation

### Scalability Considerations

1. **Horizontal Scaling**:
   - Stateless API layer
   - Lambda auto-scaling
   - Database read replicas (future)

2. **Async Processing**:
   - SQS for calendar sync jobs
   - Dead-letter queues for failures
   - Exponential backoff retries

3. **Database**:
   - Connection pooling
   - Query optimization
   - Index maintenance

### Disaster Recovery

1. **Database Backups**:
   - Automated daily backups
   - Point-in-time recovery
   - Cross-region replication (future)

2. **Code Rollback**:
   - Lambda versioning
   - API Gateway stage rollback
   - Database migration rollback

3. **Monitoring**:
   - CloudWatch alarms
   - SNS notifications
   - Incident response procedures

### Deployment Pipeline

1. **Development**:
   - Local Docker Compose setup
   - Hot-reload with tsx
   - Unit and integration tests

2. **CI/CD** (Planned):
   - GitHub Actions workflow
   - Automated testing
   - Security scanning (OWASP ZAP)
   - Terraform plan/apply
   - Canary deployments

3. **Environments**:
   - DEV: Auto-deploy on develop branch
   - STG: Auto-deploy on main branch
   - PRD: Manual approval, canary rollout

### Future Enhancements

1. **Frontend**: React admin dashboard
2. **Mobile**: Flutter employee app
3. **Features**: 
   - Carry-forward balance processing
   - Accrual calculations
   - Public holiday integration
   - Team calendar view
   - Bulk approvals
4. **Performance**:
   - Redis caching
   - GraphQL API
   - WebSocket notifications
5. **Analytics**:
   - Business intelligence dashboard
   - Predictive leave forecasting
   - Attendance pattern analysis

### References

- [OpenAPI Specification](./../leave-attendance-api/openapi/leave.v1.yaml)
- [Database Schema](./../leave-attendance-api/migrations/v2__leave_attendance.sql)
- [Environment Configuration](./../leave-attendance-api/.env.example)
- [README](./../leave-attendance-api/README.md)


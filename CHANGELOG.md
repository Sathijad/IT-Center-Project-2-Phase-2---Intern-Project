# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-phase2] - 2025-11-02

### Added
- **Leave Management**: Complete leave application and approval workflow
  - Leave policies management (ANNUAL, CASUAL, SICK, UNPAID)
  - Leave request creation with validation
  - Admin approval/rejection system
  - Leave balance tracking and deductions
  - Overlap prevention for leave requests

- **Attendance Tracking**: Employee clock-in/out system
  - Clock-in/out with optional geolocation validation
  - Duration calculation
  - Daily attendance status tracking
  - Attendance logs with pagination

- **Integration Services**: External service integrations
  - Microsoft Graph calendar sync (stub implementation)
  - AWS SES email notifications (leave requests, approvals, rejections)
  - Geofencing API for location validation

- **Administrative Features**:
  - Admin reports and summaries
  - Team leave analytics
  - Attendance logs export for payroll

- **Infrastructure**:
  - Docker Compose setup for PostgreSQL and pgAdmin
  - Database migration scripts (forward and rollback)
  - Seed data for leave policies and public holidays

- **API Features**:
  - Complete REST API with OpenAPI 3.0 specification
  - JWT authentication via AWS Cognito
  - Role-based access control (ADMIN, EMPLOYEE)
  - Idempotency support for critical operations
  - Health and readiness checks
  - Correlation ID tracking for distributed tracing

### Technical Stack

- **Backend**: Node.js 18+ with TypeScript, Express
- **Database**: PostgreSQL 15
- **Authentication**: AWS Cognito JWT
- **Deployment**: AWS Lambda + API Gateway ready
- **Testing**: Jest, Supertest, k6
- **Infrastructure**: Terraform for AWS resources
- **Documentation**: OpenAPI 3.0, comprehensive README

### Security

- JWT validation with JWKS caching
- Parameterized queries to prevent SQL injection
- Role-based access control enforcement
- CORS configuration
- Helmet security headers
- PII masking in production logs

### Database Schema

New tables:
- `leave_policies`: Leave policy configurations
- `leave_requests`: Leave request records
- `leave_balances`: User leave balances
- `attendance_logs`: Clock-in/out records
- `leave_audit`: Audit trail for leave actions
- `idempotency_keys`: Idempotency key storage
- `public_holidays`: Public holiday calendar

### API Endpoints

- `GET /api/v1/leave/balance` - Get leave balances
- `GET /api/v1/leave/requests` - List leave requests
- `POST /api/v1/leave/requests` - Create leave request
- `PATCH /api/v1/leave/requests/:id` - Update request status
- `GET /api/v1/attendance` - List attendance logs
- `GET /api/v1/attendance/today` - Get today's status
- `POST /api/v1/attendance/clock-in` - Clock in
- `POST /api/v1/attendance/clock-out` - Clock out
- `POST /api/v1/integrations/msgraph/sync` - Calendar sync
- `GET /api/v1/reports/leave-summary` - Leave summary report
- `GET /healthz` - Health check
- `GET /readyz` - Readiness check

### Database Migrations

- Forward migration: `v2__leave_attendance.sql`
- Rollback migration: `v2__leave_attendance_down.sql`
- Seed data: `seed_leave_policies.sql`

### Configuration

Environment variables documented in `.env.example`:
- Database configuration
- AWS Cognito settings
- Feature flags
- Integration credentials
- Geofencing parameters

### Documentation

- Comprehensive API documentation (OpenAPI 3.0)
- README with setup instructions
- Inline code documentation
- Migration scripts with comments

### Known Limitations

- Microsoft Graph integration is stubbed (requires OAuth implementation)
- Geofencing requires external API configuration
- AWS SES requires production configuration
- Terraform infrastructure not yet deployed
- Frontend and mobile apps not yet implemented

### Next Steps

- Implement frontend React admin dashboard
- Implement Flutter mobile app
- Deploy Terraform infrastructure
- Write comprehensive test suite
- Set up CI/CD pipeline
- Configure monitoring and alerting

### Contributors

- IT Center Development Team


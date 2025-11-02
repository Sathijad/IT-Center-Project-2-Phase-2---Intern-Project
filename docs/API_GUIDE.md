# API Guide

## Leave & Attendance Management API

### Base URL

- **Development**: `http://localhost:8082`
- **Production**: `https://api.itcenter.local` (TBD)

### Authentication

All API requests (except health checks) require a JWT bearer token from AWS Cognito.

**Header**:
```
Authorization: Bearer <token>
```

**Token Claims**:
- `sub`: User ID
- `email`: User email
- `cognito:groups`: User roles (ADMIN, EMPLOYEE)
- `cognito:username`: Username

### Roles

- **ADMIN**: Full access to all endpoints, can approve/reject leave, view all data
- **EMPLOYEE**: Can view own data, apply leave, clock in/out

### Common Headers

```
Authorization: Bearer <token>
Content-Type: application/json
Idempotency-Key: <uuid> (for POST requests)
X-Request-ID: <uuid> (optional, auto-generated)
```

## Endpoints

### Leave Management

#### Get Leave Balances

```
GET /api/v1/leave/balance?user_id={uuid}
```

**Authorization**: EMPLOYEE (own), ADMIN (any)

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "policyId": "uuid",
      "balanceDays": 15.5,
      "updatedAt": "2025-11-02T10:00:00Z"
    }
  ]
}
```

#### List Leave Requests

```
GET /api/v1/leave/requests?user_id={uuid}&status={status}&from={date}&to={date}&page={page}&size={size}
```

**Query Parameters**:
- `user_id`: Filter by user (optional)
- `status`: Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
- `from`: Start date filter (YYYY-MM-DD)
- `to`: End date filter (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `size`: Page size (default: 20)

**Response**:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "size": 20,
  "totalPages": 5
}
```

**Headers**:
- `X-Total-Count`: Total number of records

#### Create Leave Request

```
POST /api/v1/leave/requests
Headers: Idempotency-Key: <uuid>
```

**Request Body**:
```json
{
  "policy_id": "uuid",
  "start_date": "2025-11-15",
  "end_date": "2025-11-17",
  "half_day": "AM",
  "reason": "Personal leave"
}
```

**Idempotency**: Requires `Idempotency-Key` header. Duplicate requests with same key return cached response.

**Validation**:
- Balance sufficiency
- Overlap prevention
- Minimum notice period
- Date range validity

**Error Codes**:
- `LEAVE_OVERLAP`: Overlaps with existing request
- `INSUFFICIENT_BALANCE`: Not enough leave days
- `INVALID_DATE_RANGE`: End before start
- `VALIDATION_ERROR`: Other validation failures

#### Update Leave Request

```
PATCH /api/v1/leave/requests/{id}
```

**Authorization**: ADMIN only

**Request Body**:
```json
{
  "status": "APPROVED",
  "notes": "Approved by HR"
}
```

**Actions**:
- `APPROVED`: Deducts balance, triggers calendar sync
- `REJECTED`: Returns balance (if was approved)
- `CANCELLED`: User cancels own request

### Attendance

#### List Attendance Logs

```
GET /api/v1/attendance?user_id={uuid}&from={date}&to={date}&page={page}&size={size}
```

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "clockIn": "2025-11-02T09:00:00Z",
      "clockOut": "2025-11-02T17:30:00Z",
      "durationMinutes": 510,
      "lat": -33.8688,
      "lng": 151.2093,
      "source": "MOBILE",
      "createdAt": "2025-11-02T09:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "size": 20,
  "totalPages": 3
}
```

#### Get Today's Status

```
GET /api/v1/attendance/today
```

**Response**:
```json
{
  "data": {
    "status": "CLOCKED_IN",
    "log": {
      "id": "uuid",
      "clockIn": "2025-11-02T09:00:00Z",
      ...
    }
  }
}
```

**Statuses**: `NOT_STARTED`, `CLOCKED_IN`, `CLOCKED_OUT`

#### Clock In

```
POST /api/v1/attendance/clock-in
Headers: Idempotency-Key: <uuid>
```

**Request Body**:
```json
{
  "lat": -33.8688,
  "lng": 151.2093,
  "source": "MOBILE"
}
```

**Geolocation**: Optional, validated if `ENABLE_GEO_VALIDATION=true`

**Error Codes**:
- `ALREADY_CLOCKED_IN`: Already clocked in today
- `GEO_OUT_OF_RANGE`: Outside allowed area

**Idempotency**: Requires `Idempotency-Key` header

#### Clock Out

```
POST /api/v1/attendance/clock-out
```

**Response**:
```json
{
  "success": true
}
```

**Error Codes**:
- `CLOCK_OUT_MISSING_IN`: No clock-in found for today
- `ALREADY_CLOCKED_OUT`: Already clocked out today

### Reports

#### Get Leave Summary

```
GET /api/v1/reports/leave-summary?range={days}&team_id={uuid}
```

**Authorization**: ADMIN only

**Query Parameters**:
- `range`: Number of days to include (default: 30)
- `team_id`: Filter by team (optional)

**Response**:
```json
{
  "data": {
    "totalRequests": 150,
    "approvedCount": 120,
    "rejectedCount": 10,
    "pendingCount": 20,
    "totalDays": 450.5,
    "approvalRate": 80.0,
    "ranges": [
      {
        "status": "APPROVED",
        "count": 120,
        "total_days": 360,
        ...
      }
    ]
  }
}
```

### Integrations

#### Sync Calendar

```
POST /api/v1/integrations/msgraph/sync
```

**Authorization**: ADMIN only

**Request Body**:
```json
{
  "user_id": "uuid",
  "start_date": "2025-11-15",
  "end_date": "2025-11-17",
  "reason": "Annual leave"
}
```

Creates calendar block in user's Outlook via Microsoft Graph.

### System

#### Health Check

```
GET /healthz
```

**No authentication required**

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-02T10:00:00Z",
  "service": "leave-attendance-api"
}
```

#### Readiness Check

```
GET /readyz
```

**No authentication required**

**Response**:
```json
{
  "status": "ready",
  "checks": {
    "database": true,
    "jwks": true
  },
  "timestamp": "2025-11-02T10:00:00Z"
}
```

**Status Codes**:
- `200`: Ready
- `503`: Not ready (database or JWKS unreachable)

## Error Handling

All errors follow this format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2025-11-02T10:00:00Z"
}
```

### Common Error Codes

- `UNAUTHORIZED`: Missing or invalid token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `BAD_REQUEST`: Invalid request data
- `LEAVE_OVERLAP`: Leave request overlaps with existing
- `INSUFFICIENT_BALANCE`: Not enough leave balance
- `POLICY_LIMIT_EXCEEDED`: Exceeds policy limits
- `GEO_OUT_OF_RANGE`: Location outside allowed area
- `ALREADY_CLOCKED_IN`: Already clocked in today
- `CLOCK_OUT_MISSING_IN`: No clock-in found
- `INVALID_DATE_RANGE`: End date before start date
- `INTERNAL_ERROR`: Unexpected server error

### HTTP Status Codes

- `200`: Success (GET, PATCH, POST)
- `201`: Created (POST)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error
- `503`: Service Unavailable (readiness check)

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page`: Page number (default: 1)
- `size`: Page size (default: 20, max: 100)

**Response**:
- `data`: Array of results
- `total`: Total number of records
- `page`: Current page number
- `size`: Page size
- `totalPages`: Total number of pages

**Headers**:
- `X-Total-Count`: Total number of records

## Idempotency

POST requests that modify state (`POST /leave/requests`, `POST /attendance/clock-in`) support idempotency.

**Header**: `Idempotency-Key: <uuid>`

**Behavior**:
- Same key within 24 hours returns cached response
- Responses cached for successful operations
- Protects against duplicate submissions

## Rate Limiting

- Per-user: 100 requests/minute (configurable)
- Per-IP: Based on infrastructure configuration

## Examples

### cURL Examples

**Get Leave Balances**:
```bash
curl -X GET "http://localhost:8082/api/v1/leave/balance?user_id=abc-123" \
  -H "Authorization: Bearer <token>"
```

**Create Leave Request**:
```bash
curl -X POST "http://localhost:8082/api/v1/leave/requests" \
  -H "Authorization: Bearer <token>" \
  -H "Idempotency-Key: <uuid>" \
  -H "Content-Type: application/json" \
  -d '{
    "policy_id": "uuid",
    "start_date": "2025-11-15",
    "end_date": "2025-11-17",
    "half_day": "AM",
    "reason": "Personal leave"
  }'
```

**Clock In**:
```bash
curl -X POST "http://localhost:8082/api/v1/attendance/clock-in" \
  -H "Authorization: Bearer <token>" \
  -H "Idempotency-Key: <uuid>" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -33.8688,
    "lng": 151.2093,
    "source": "MOBILE"
  }'
```

### Postman

Import the OpenAPI specification:
```
leave-attendance-api/openapi/leave.v1.yaml
```

Environment variables:
- `base_url`: `http://localhost:8082`
- `token`: JWT bearer token
- `user_id`: Your user ID

## Testing

### Health Check
```bash
curl http://localhost:8082/healthz
```

### Readiness Check
```bash
curl http://localhost:8082/readyz
```

### Get Token (using Cognito)

```bash
curl -X POST "https://itcenter-auth.auth.ap-southeast-2.amazoncognito.com/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_CLIENT_ID&scope=openid"
```

## Best Practices

1. **Always use idempotency keys** for POST requests
2. **Handle 401 responses** by refreshing tokens
3. **Respect rate limits** and implement backoff
4. **Use correlation IDs** for debugging
5. **Cache responses** when appropriate
6. **Validate dates** client-side before sending
7. **Handle errors gracefully** with user-friendly messages

## Support

For issues or questions:
- Check the OpenAPI spec for detailed schemas
- Review the architecture documentation
- Check logs for correlation IDs
- Contact the IT Center development team


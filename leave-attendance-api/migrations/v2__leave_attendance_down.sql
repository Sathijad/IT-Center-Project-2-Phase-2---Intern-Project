-- Phase 2: Rollback Leave & Attendance Management Schema

-- Drop triggers
DROP TRIGGER IF EXISTS update_leave_balances_updated_at ON leave_balances;
DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON leave_requests;
DROP TRIGGER IF EXISTS update_leave_policies_updated_at ON leave_policies;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop foreign key constraints (if they exist)
ALTER TABLE leave_audit DROP CONSTRAINT IF EXISTS fk_leave_audit_actor;
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS fk_leave_requests_approved_by;
ALTER TABLE leave_audit DROP CONSTRAINT IF EXISTS fk_leave_audit_request;
ALTER TABLE attendance_logs DROP CONSTRAINT IF EXISTS fk_attendance_logs_user;
ALTER TABLE leave_balances DROP CONSTRAINT IF EXISTS fk_leave_balances_user;
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS fk_leave_requests_user;

-- Drop tables (order matters due to FK constraints)
DROP TABLE IF EXISTS idempotency_keys;
DROP TABLE IF EXISTS leave_audit;
DROP TABLE IF EXISTS attendance_logs;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_policies;


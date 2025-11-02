-- Phase 2: Staff Leave & Attendance Management Schema

-- Leave policies (annual, casual, sick, unpaid)
CREATE TABLE IF NOT EXISTS leave_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('ANNUAL', 'CASUAL', 'SICK', 'UNPAID')),
  max_days INTEGER NOT NULL,
  carry_forward BOOLEAN DEFAULT false,
  accrual VARCHAR(20) DEFAULT 'YEARLY' CHECK (accrual IN ('MONTHLY', 'YEARLY')),
  min_notice_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  policy_id UUID NOT NULL REFERENCES leave_policies(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  half_day VARCHAR(2) CHECK (half_day IN ('AM', 'PM')),
  reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Prevent overlapping leave requests (service-level + unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_no_overlap 
  ON leave_requests (user_id, start_date, end_date) 
  WHERE status IN ('PENDING', 'APPROVED');

-- Indexes for leave_requests
CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_policy ON leave_requests(policy_id);

-- Leave balances
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  policy_id UUID NOT NULL REFERENCES leave_policies(id) ON DELETE RESTRICT,
  balance_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, policy_id)
);

CREATE INDEX IF NOT EXISTS idx_leave_balances_user ON leave_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_policy ON leave_balances(policy_id);

-- Attendance logs
CREATE TABLE IF NOT EXISTS attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  duration_minutes INTEGER,
  lat NUMERIC(9,6),
  lng NUMERIC(9,6),
  source VARCHAR(20) DEFAULT 'MOBILE' CHECK (source IN ('MOBILE', 'WEB', 'ADMIN')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_dates ON attendance_logs(clock_in, clock_out);
CREATE INDEX IF NOT EXISTS idx_attendance_clock_in ON attendance_logs(clock_in DESC);

-- Leave audit trail
CREATE TABLE IF NOT EXISTS leave_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  actor_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_audit_request ON leave_audit(request_id);
CREATE INDEX IF NOT EXISTS idx_leave_audit_actor ON leave_audit(actor_id);
CREATE INDEX IF NOT EXISTS idx_leave_audit_created ON leave_audit(created_at DESC);

-- Idempotency keys (24h TTL)
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key VARCHAR(255) PRIMARY KEY,
  response_body JSONB,
  status_code INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idempotency_created ON idempotency_keys(created_at);

-- Add foreign key constraints for user_id (assuming app_users table exists from Phase 1)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_users') THEN
    ALTER TABLE leave_requests 
      ADD CONSTRAINT fk_leave_requests_user 
      FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
    
    ALTER TABLE leave_balances 
      ADD CONSTRAINT fk_leave_balances_user 
      FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
    
    ALTER TABLE attendance_logs 
      ADD CONSTRAINT fk_attendance_logs_user 
      FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
    
    ALTER TABLE leave_requests 
      ADD CONSTRAINT fk_leave_requests_approved_by 
      FOREIGN KEY (approved_by) REFERENCES app_users(id) ON DELETE SET NULL;
    
    ALTER TABLE leave_audit 
      ADD CONSTRAINT fk_leave_audit_actor 
      FOREIGN KEY (actor_id) REFERENCES app_users(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to leave_policies
CREATE TRIGGER update_leave_policies_updated_at 
  BEFORE UPDATE ON leave_policies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to leave_requests
CREATE TRIGGER update_leave_requests_updated_at 
  BEFORE UPDATE ON leave_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to leave_balances
CREATE TRIGGER update_leave_balances_updated_at 
  BEFORE UPDATE ON leave_balances 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


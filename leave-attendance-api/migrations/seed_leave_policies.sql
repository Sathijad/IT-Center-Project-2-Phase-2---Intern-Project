-- Seed data for Phase 2: Leave Policies

-- Insert default leave policies
INSERT INTO leave_policies (type, max_days, carry_forward, accrual, min_notice_days) VALUES
('ANNUAL', 20, true, 'YEARLY', 2),
('CASUAL', 10, false, 'YEARLY', 1),
('SICK', 15, false, 'YEARLY', 0)
ON CONFLICT DO NOTHING;

-- Create initial balances for all existing users (if app_users table exists)
DO $$
DECLARE
  user_record RECORD;
  policy_record RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_users') THEN
    -- Loop through all users
    FOR user_record IN SELECT id FROM app_users LOOP
      -- Loop through all policies
      FOR policy_record IN SELECT id, max_days FROM leave_policies LOOP
        -- Insert balance for this user-policy combination
        INSERT INTO leave_balances (user_id, policy_id, balance_days)
        VALUES (user_record.id, policy_record.id, policy_record.max_days)
        ON CONFLICT (user_id, policy_id) DO NOTHING;
      END LOOP;
    END LOOP;
  END IF;
END $$;

-- Sample public holidays for 2025 (Australian calendar)
CREATE TABLE IF NOT EXISTS public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public_holidays (date, name) VALUES
('2025-01-01', 'New Year''s Day'),
('2025-01-27', 'Australia Day'),
('2025-03-10', 'Labour Day'),
('2025-04-18', 'Good Friday'),
('2025-04-21', 'Easter Monday'),
('2025-04-25', 'ANZAC Day'),
('2025-06-09', 'Queen''s Birthday'),
('2025-10-06', 'Labour Day'),
('2025-12-25', 'Christmas Day'),
('2025-12-26', 'Boxing Day')
ON CONFLICT (date) DO NOTHING;

-- Create index for public holidays lookup
CREATE INDEX IF NOT EXISTS idx_public_holidays_date ON public_holidays(date);


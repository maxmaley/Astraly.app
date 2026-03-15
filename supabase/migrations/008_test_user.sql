-- Add is_test flag for test users (get cosmic plan without payment/expiry)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

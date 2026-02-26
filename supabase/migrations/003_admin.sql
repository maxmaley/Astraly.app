-- ============================================================
-- Astraly — Admin Panel Support
-- Run in Supabase SQL Editor: Dashboard → SQL Editor → New query
-- ============================================================

-- Add admin and banned flags to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_admin  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false;

-- Grant super-admin to the owner
UPDATE users
  SET is_admin = true
  WHERE email = 'oksmaleyniks@gmail.com';

-- Fix: default tokens_left was 5000, but Free plan gives 10000
-- This caused new users to show 50% energy instead of 100%

-- 1. Change column default to match Free plan monthlyTokens
ALTER TABLE users ALTER COLUMN tokens_left SET DEFAULT 10000;

-- 2. Fix existing free users who got the wrong default
UPDATE users
SET tokens_left = 10000
WHERE subscription_tier = 'free'
  AND tokens_left = 5000;

-- Add memory_enabled toggle for user consent (default false — opt-in)
ALTER TABLE users ADD COLUMN IF NOT EXISTS memory_enabled BOOLEAN NOT NULL DEFAULT false;

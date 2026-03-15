-- Add memory column to users table for AI astrologer memory system
ALTER TABLE users ADD COLUMN IF NOT EXISTS memory TEXT NOT NULL DEFAULT '';

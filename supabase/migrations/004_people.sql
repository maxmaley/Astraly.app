-- ============================================================
-- Astraly — People / Multi-chart support
-- ============================================================

-- Add chart_ids to chat_summaries so each chat remembers
-- which natal charts were part of its context.
-- Stored as a JSON array of natal_chart UUIDs.
ALTER TABLE chat_summaries
  ADD COLUMN IF NOT EXISTS chart_ids JSONB NOT NULL DEFAULT '[]';

-- Index for potential future queries on chart_ids
CREATE INDEX IF NOT EXISTS idx_chat_summaries_chart_ids
  ON chat_summaries USING gin (chart_ids);

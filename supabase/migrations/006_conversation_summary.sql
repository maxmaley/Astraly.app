-- Add conversation_summary to chat_summaries for sliding-window context
ALTER TABLE chat_summaries
  ADD COLUMN IF NOT EXISTS conversation_summary TEXT;

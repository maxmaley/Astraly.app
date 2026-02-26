-- ============================================================
-- Astraly — Fix daily_horoscopes RLS policies
-- The initial schema only had SELECT. Add INSERT + UPDATE so the
-- API route (running as the user via cookie auth) can upsert horoscopes.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- Allow users to insert their own horoscopes
CREATE POLICY "Users can insert own horoscopes" ON daily_horoscopes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update (upsert) their own horoscopes
CREATE POLICY "Users can update own horoscopes" ON daily_horoscopes
  FOR UPDATE USING (auth.uid() = user_id);

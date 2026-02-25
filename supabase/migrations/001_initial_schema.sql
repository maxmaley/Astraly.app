-- ============================================================
-- Astraly — Initial Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enums ──────────────────────────────────────────────────
CREATE TYPE subscription_tier AS ENUM ('free', 'moonlight', 'solar', 'cosmic');
CREATE TYPE relation AS ENUM ('self', 'partner', 'mom', 'friend', 'other');
CREATE TYPE message_role AS ENUM ('user', 'assistant');

-- ── Users ──────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  tokens_left   INTEGER NOT NULL DEFAULT 5000,
  tokens_reset_at TIMESTAMPTZ,
  lang          TEXT NOT NULL DEFAULT 'ru',
  theme         TEXT NOT NULL DEFAULT 'dark',
  telegram_chat_id TEXT,
  notify_email  BOOLEAN NOT NULL DEFAULT true,
  notify_telegram BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Natal Charts ───────────────────────────────────────────
CREATE TABLE natal_charts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  relation      relation NOT NULL DEFAULT 'self',
  birth_date    DATE NOT NULL,
  birth_time    TIME,
  birth_city    TEXT NOT NULL,
  lat           DECIMAL(9, 6) NOT NULL,
  lng           DECIMAL(9, 6) NOT NULL,
  planets_json  JSONB NOT NULL DEFAULT '{}',
  houses_json   JSONB NOT NULL DEFAULT '[]',
  ascendant     JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Chat Messages ──────────────────────────────────────────
CREATE TABLE chat_messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chat_id       UUID NOT NULL,
  chart_id      UUID REFERENCES natal_charts(id) ON DELETE SET NULL,
  role          message_role NOT NULL,
  content       TEXT NOT NULL,
  tokens_used   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);

-- ── Chat Summaries ─────────────────────────────────────────
CREATE TABLE chat_summaries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chat_id         UUID NOT NULL,
  chart_id        UUID REFERENCES natal_charts(id) ON DELETE SET NULL,
  summary         TEXT NOT NULL,
  messages_count  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_summaries_chat_id ON chat_summaries(chat_id);

-- ── Daily Horoscopes ───────────────────────────────────────
CREATE TABLE daily_horoscopes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  content     TEXT NOT NULL,
  sent_email  BOOLEAN NOT NULL DEFAULT false,
  sent_tg     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_horoscopes_user_date ON daily_horoscopes(user_id, date);

-- ── Subscriptions ──────────────────────────────────────────
CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan              subscription_tier NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active', -- active | cancelled | expired | trialing
  lemon_squeezy_id  TEXT UNIQUE,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_lemon_id ON subscriptions(lemon_squeezy_id);

-- ── Row Level Security ─────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE natal_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_horoscopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users: can only read/update own row
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Natal charts: own data only
CREATE POLICY "Users can CRUD own natal charts" ON natal_charts
  FOR ALL USING (auth.uid() = user_id);

-- Chat messages: own data only
CREATE POLICY "Users can CRUD own chat messages" ON chat_messages
  FOR ALL USING (auth.uid() = user_id);

-- Chat summaries: own data only
CREATE POLICY "Users can CRUD own chat summaries" ON chat_summaries
  FOR ALL USING (auth.uid() = user_id);

-- Daily horoscopes: own data only
CREATE POLICY "Users can view own horoscopes" ON daily_horoscopes
  FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions: own data only
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ── Auto-create user profile on signup ────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ── Updated_at triggers ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_natal_charts_updated_at BEFORE UPDATE ON natal_charts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

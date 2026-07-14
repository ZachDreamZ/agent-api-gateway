-- Agent API Gateway — PostgreSQL Schema
-- Run in Supabase SQL editor to bootstrap.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Users ───

CREATE TABLE public.users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,  -- Billing provider customer ID (Polar)
  tier        TEXT NOT NULL DEFAULT 'free'
              CHECK (tier IN ('free', 'hobby', 'pro', 'scale')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── API Keys ───

CREATE TABLE public.api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  key_hash     TEXT NOT NULL,
  name         TEXT NOT NULL,
  active       BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id  ON public.api_keys(user_id);

-- ─── Usage Logs ───

CREATE TABLE public.usage_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  api_key_id   UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint     TEXT NOT NULL,
  schema       TEXT,
  url          TEXT,
  cached       BOOLEAN NOT NULL DEFAULT false,
  latency_ms   INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user_id     ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at  ON public.usage_logs(created_at);
CREATE INDEX idx_usage_logs_user_month  ON public.usage_logs(user_id, created_at);

-- ─── Row-Level Security ───

ALTER TABLE public.users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; these protect against direct user-access scenarios.
CREATE POLICY "Service role manages users"
  ON public.users FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages api_keys"
  ON public.api_keys FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages usage_logs"
  ON public.usage_logs FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users view own usage_logs"
  ON public.usage_logs FOR SELECT
  USING (user_id = auth.uid());

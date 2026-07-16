-- Usage logs table for Render PostgreSQL (Better Auth compatible)
-- Uses TEXT IDs to match Better Auth's user table.
CREATE TABLE IF NOT EXISTS usage_logs (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id      TEXT NOT NULL,
  api_key_id   TEXT,
  endpoint     TEXT NOT NULL,
  schema       TEXT,
  url          TEXT,
  cached       BOOLEAN NOT NULL DEFAULT false,
  latency_ms   INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_month ON usage_logs(user_id, created_at);

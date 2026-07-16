-- Agent API Gateway — Rate Limiting Table
-- Created for Better Auth database-backed rate limiting.
-- Safe: uses CREATE TABLE IF NOT EXISTS for idempotency.

CREATE TABLE IF NOT EXISTS "rateLimit" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key         TEXT NOT NULL UNIQUE,
  count       INTEGER NOT NULL DEFAULT 1,
  "lastRequest" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint
);

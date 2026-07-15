-- Better Auth migration — Agent API Gateway
-- Run ONCE in the Supabase SQL Editor (Project → SQL → New query → paste → Run).
--
-- Creates the 5 Better Auth tables (text IDs, camelCase columns) and the
-- usage_logs table for API usage tracking. Drops only the old api_keys table.
-- NOTE: signalos shares this Supabase project — its `users` table is NOT dropped.

-- ─── Better Auth: user ───
CREATE TABLE IF NOT EXISTS public."user" (
  "id"                   text PRIMARY KEY,
  "name"                 text,
  "email"                text UNIQUE NOT NULL,
  "emailVerified"        boolean NOT NULL DEFAULT false,
  "image"                text,
  "createdAt"            timestamptz NOT NULL DEFAULT now(),
  "updatedAt"            timestamptz NOT NULL DEFAULT now(),
  "tier"                 text DEFAULT 'free',
  "stripe_customer_id"   text
);

-- ─── Better Auth: session ───
CREATE TABLE IF NOT EXISTS public."session" (
  "id"         text PRIMARY KEY,
  "expiresAt"  timestamptz NOT NULL,
  "token"      text UNIQUE NOT NULL,
  "createdAt"  timestamptz NOT NULL DEFAULT now(),
  "updatedAt"  timestamptz NOT NULL DEFAULT now(),
  "ipAddress"  text,
  "userAgent"  text,
  "userId"     text NOT NULL REFERENCES public."user"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON public."session"("userId");

-- ─── Better Auth: account ───
CREATE TABLE IF NOT EXISTS public."account" (
  "id"                       text PRIMARY KEY,
  "accountId"                text NOT NULL,
  "providerId"               text NOT NULL,
  "userId"                   text NOT NULL REFERENCES public."user"("id") ON DELETE CASCADE,
  "accessToken"              text,
  "refreshToken"             text,
  "idToken"                  text,
  "accessTokenExpiresAt"     timestamptz,
  "refreshTokenExpiresAt"    timestamptz,
  "scope"                    text,
  "password"                 text,
  "createdAt"                timestamptz NOT NULL DEFAULT now(),
  "updatedAt"                timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON public."account"("userId");

-- ─── Better Auth: verification ───
CREATE TABLE IF NOT EXISTS public."verification" (
  "id"         text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value"      text NOT NULL,
  "expiresAt"  timestamptz NOT NULL,
  "createdAt"  timestamptz NOT NULL DEFAULT now(),
  "updatedAt"  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON public."verification"("identifier");

-- ─── Better Auth: apikey ───
CREATE TABLE IF NOT EXISTS public."apikey" (
  "id"                  text PRIMARY KEY,
  "configId"            text NOT NULL DEFAULT 'default',
  "name"                text,
  "start"               text,
  "referenceId"         text NOT NULL REFERENCES public."user"("id") ON DELETE CASCADE,
  "prefix"              text,
  "key"                 text NOT NULL,
  "refillInterval"      bigint,
  "refillAmount"        bigint,
  "lastRefillAt"        timestamptz,
  "enabled"             boolean DEFAULT true,
  "rateLimitEnabled"    boolean DEFAULT true,
  "rateLimitTimeWindow" bigint DEFAULT 86400000,
  "rateLimitMax"        bigint DEFAULT 10,
  "requestCount"        bigint DEFAULT 0,
  "remaining"           bigint,
  "lastRequest"         timestamptz,
  "expiresAt"           timestamptz,
  "createdAt"           timestamptz NOT NULL DEFAULT now(),
  "updatedAt"           timestamptz NOT NULL DEFAULT now(),
  "permissions"         text,
  "metadata"            text
);
CREATE INDEX IF NOT EXISTS "apikey_referenceId_idx" ON public."apikey"("referenceId");
CREATE INDEX IF NOT EXISTS "apikey_key_idx" ON public."apikey"("key");

-- ─── Drop OLD agent-api-gateway tables only (not signalos's `users`) ───
-- NOTE: signalos uses the same Supabase project and its `users` table must survive.
-- We only drop `api_keys` which was created by agent-api-gateway's earlier auth.
DROP TABLE IF EXISTS public.api_keys CASCADE;

-- DO NOT DROP public.users — signalos shares this database.

-- ─── Create usage_logs if it does not exist yet ───
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id     ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at  ON public.usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_month  ON public.usage_logs(user_id, created_at);

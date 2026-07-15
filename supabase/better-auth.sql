-- Better Auth migration — Agent API Gateway
-- Run ONCE in the Supabase SQL Editor (Project → SQL → New query → paste → Run).
--
-- Creates the 5 Better Auth tables (text IDs, camelCase columns) with the
-- tier / stripe_customer_id additional fields on "user", converts the existing
-- usage_logs.user_id / api_key_id from UUID -> text to match Better Auth's
-- cuid IDs, and drops the old users / api_keys tables that this auth replaces.

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

-- ─── Re-point usage_logs at Better Auth IDs (UUID -> text) ───
ALTER TABLE public.usage_logs DROP CONSTRAINT IF EXISTS usage_logs_user_id_fkey;
ALTER TABLE public.usage_logs DROP CONSTRAINT IF EXISTS usage_logs_api_key_id_fkey;
ALTER TABLE public.usage_logs ALTER COLUMN user_id    TYPE text USING user_id::text;
ALTER TABLE public.usage_logs ALTER COLUMN api_key_id TYPE text USING api_key_id::text;

-- ─── Drop the old tables this auth replaces ───
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

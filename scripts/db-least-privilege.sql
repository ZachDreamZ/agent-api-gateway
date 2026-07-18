-- Least-privilege DB roles (OpenVPN checklist: network segmentation — credential isolation).
-- Both apps share one Render Postgres (`agentapi_kjz2`) and the public schema.
-- This creates per-app roles with their own credentials so each app's DB
-- password can be rotated/revoked independently, without touching the shared
-- owner role (`agentapi_user`). Tables stay shared (both apps read/write the
-- same Better Auth tables); the win is credential separation + revocability.
--
-- Run from a host with DB network access (Render shell, or your IP temporarily
-- added to PostgreSQL Inbound IP Rules), e.g.:
--   psql "<internal-or-external-url>" -f scripts/db-least-privilege.sql
--
-- Idempotent: safe to re-run.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'agentapi_app') THEN
    CREATE ROLE agentapi_app LOGIN PASSWORD 'CHANGE_ME_agentapi';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'statusplate_app') THEN
    CREATE ROLE statusplate_app LOGIN PASSWORD 'CHANGE_ME_statusplate';
  END IF;
END
$$;

-- Grant the same working privileges the apps need (mirrors agentapi_user).
GRANT CONNECT ON DATABASE agentapi_kjz2 TO agentapi_app, statusplate_app;
GRANT USAGE ON SCHEMA public TO agentapi_app, statusplate_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
  TO agentapi_app, statusplate_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public
  TO agentapi_app, statusplate_app;
-- Future tables (migrations create new ones) also get the grants.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO agentapi_app, statusplate_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO agentapi_app, statusplate_app;

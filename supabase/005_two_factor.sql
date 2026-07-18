-- Better Auth 2FA (TOTP) support — Agent API Gateway
-- Adds the twoFactor table and the twoFactorEnabled flag on user.
-- Idempotent: safe to re-run.

-- ─── user.twoFactorEnabled flag ───
ALTER TABLE public."user"
  ADD COLUMN IF NOT EXISTS "twoFactorEnabled" boolean NOT NULL DEFAULT false;

-- ─── twoFactor table ───
CREATE TABLE IF NOT EXISTS public."twoFactor" (
  "id"                     text PRIMARY KEY,
  "secret"                 text NOT NULL,
  "backupCodes"            text NOT NULL,
  "userId"                 text NOT NULL REFERENCES public."user"("id") ON DELETE CASCADE,
  "verified"               boolean NOT NULL DEFAULT true,
  "failedVerificationCount" integer NOT NULL DEFAULT 0,
  "lockedUntil"            timestamptz
);
CREATE INDEX IF NOT EXISTS "twoFactor_userId_idx" ON public."twoFactor"("userId");
CREATE INDEX IF NOT EXISTS "twoFactor_secret_idx" ON public."twoFactor"("secret");

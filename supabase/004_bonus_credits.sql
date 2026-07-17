-- Purchased credit packs stack on top of monthly tier allowances.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS bonus_credits INTEGER NOT NULL DEFAULT 0;

-- This migration adds dedicated columns for new point categories to the wallets table
-- to properly segregate different types of points.

ALTER TABLE public.wallets
ADD COLUMN IF NOT EXISTS wisdom_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ping_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dont_panic_points INTEGER DEFAULT 0;


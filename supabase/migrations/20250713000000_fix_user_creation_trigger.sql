-- This migration fixes a bug where new users were not getting a user profile or wallet created.
-- The on_auth_user_created trigger was failing silently due to missing or restrictive
-- Row Level Security (RLS) policies on the 'users' and 'wallets' tables.
--
-- The fix involves adding policies that explicitly grant the 'postgres' role
-- (which runs the trigger) permission to insert into these tables.

-- 1. Add an INSERT policy for the 'users' table.
-- This was missing, causing the first INSERT in the trigger to fail.
CREATE POLICY "Allow postgres to create user profiles via trigger"
ON public.users FOR INSERT
TO postgres
WITH CHECK (true);

-- 2. Add an INSERT policy for the 'wallets' table.
-- The existing policy only checked auth.uid(), which is NULL in the trigger's context.
-- This adds a specific policy for the postgres role.
CREATE POLICY "Allow postgres to create wallets via trigger"
ON public.wallets FOR INSERT
TO postgres
WITH CHECK (true); 
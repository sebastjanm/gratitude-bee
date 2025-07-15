-- Add last_seen column to track user activity
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

-- The existing RLS policies on public.users already grant select and update
-- permissions to the authenticated user for their own row, which is sufficient
-- for the client to update the `last_seen` field. No policy changes are needed.

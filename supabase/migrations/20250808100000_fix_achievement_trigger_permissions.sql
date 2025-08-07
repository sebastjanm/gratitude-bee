-- Fix achievement trigger permissions to allow it to update achievements table
-- when events are inserted by regular users

-- The update_achievement_progress function needs to run with elevated privileges
-- because regular users don't have INSERT/UPDATE permissions on achievements table
-- (only SELECT via RLS policy)
ALTER FUNCTION update_achievement_progress() SECURITY DEFINER;

-- Also update the distribute_achievement_reward function if it exists
-- Check if the function exists first
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'distribute_achievement_reward'
  ) THEN
    ALTER FUNCTION distribute_achievement_reward() SECURITY DEFINER;
  END IF;
END $$;

-- Ensure the postgres role has necessary permissions
GRANT ALL ON achievements TO postgres;
GRANT ALL ON achievement_definitions TO postgres;
GRANT ALL ON achievement_rewards_log TO postgres;

-- Grant USAGE on sequences if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class 
    WHERE relkind = 'S' AND relname = 'achievements_id_seq'
  ) THEN
    GRANT USAGE ON SEQUENCE achievements_id_seq TO postgres;
  END IF;
END $$;
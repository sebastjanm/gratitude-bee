-- Safe migration: Only add what's missing, don't break existing functionality

-- 1. Add unique constraint if it doesn't exist (for upsert operations)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'achievements_user_achievement_unique'
  ) THEN
    ALTER TABLE achievements 
    ADD CONSTRAINT achievements_user_achievement_unique 
    UNIQUE(user_id, achievement_type);
  END IF;
END $$;

-- 2. Extend the existing update_achievement_progress function
-- This preserves your existing logic and adds new achievement types
CREATE OR REPLACE FUNCTION update_achievement_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Existing appreciation achievements
  IF NEW.event_type = 'APPRECIATION' THEN
    INSERT INTO achievements (user_id, achievement_type, progress, target)
    VALUES 
      (NEW.sender_id, 'appreciation_10', 1, 10),
      (NEW.sender_id, 'appreciation_100', 1, 100)
    ON CONFLICT (user_id, achievement_type) 
    DO UPDATE SET progress = achievements.progress + 1;
    
    -- Check if achievement unlocked
    UPDATE achievements 
    SET unlocked_at = NOW()
    WHERE user_id = NEW.sender_id 
    AND progress >= target 
    AND unlocked_at IS NULL;
  END IF;

  -- NEW: Add more event types (only if you want them)
  -- Favor completion
  IF NEW.event_type = 'FAVOR_COMPLETED' THEN
    INSERT INTO achievements (user_id, achievement_type, progress, target)
    VALUES (NEW.sender_id, 'favor_helper_10', 1, 10)
    ON CONFLICT (user_id, achievement_type) 
    DO UPDATE SET progress = achievements.progress + 1;
    
    UPDATE achievements 
    SET unlocked_at = NOW()
    WHERE user_id = NEW.sender_id 
    AND achievement_type = 'favor_helper_10'
    AND progress >= target 
    AND unlocked_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger ONLY if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_achievement_progress_trigger'
  ) THEN
    CREATE TRIGGER update_achievement_progress_trigger
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_achievement_progress();
  END IF;
END $$;

-- 4. Insert achievement definitions (safe with ON CONFLICT)
INSERT INTO achievement_definitions (type, name, description, icon_name, target, reward_points, category)
VALUES 
  ('appreciation_10', 'Gratitude Starter', 'Send 10 appreciations', 'Heart', 10, 20, 'appreciation'),
  ('appreciation_100', 'Gratitude Master', 'Send 100 appreciations', 'Crown', 100, 200, 'appreciation'),
  ('favor_helper_10', 'Helpful Partner', 'Complete 10 favors', 'HelpingHand', 10, 50, 'favor')
ON CONFLICT (type) DO NOTHING;

-- 5. Optional: Backfill existing data (safe, won't duplicate)
-- This counts existing events and updates progress
DO $$
DECLARE
  user_record RECORD;
  appreciation_count INTEGER;
  favor_count INTEGER;
BEGIN
  FOR user_record IN SELECT DISTINCT sender_id FROM events
  LOOP
    -- Count existing appreciations
    SELECT COUNT(*) INTO appreciation_count
    FROM events
    WHERE sender_id = user_record.sender_id 
    AND event_type = 'APPRECIATION';

    IF appreciation_count > 0 THEN
      INSERT INTO achievements (user_id, achievement_type, progress, target, unlocked_at)
      VALUES 
        (user_record.sender_id, 'appreciation_10', 
         LEAST(appreciation_count, 10), 10,
         CASE WHEN appreciation_count >= 10 THEN NOW() ELSE NULL END),
        (user_record.sender_id, 'appreciation_100', 
         LEAST(appreciation_count, 100), 100,
         CASE WHEN appreciation_count >= 100 THEN NOW() ELSE NULL END)
      ON CONFLICT (user_id, achievement_type) 
      DO UPDATE SET 
        progress = EXCLUDED.progress,
        unlocked_at = COALESCE(achievements.unlocked_at, EXCLUDED.unlocked_at);
    END IF;

    -- Count existing favor completions
    SELECT COUNT(*) INTO favor_count
    FROM events
    WHERE sender_id = user_record.sender_id 
    AND event_type = 'FAVOR_COMPLETED';

    IF favor_count > 0 THEN
      INSERT INTO achievements (user_id, achievement_type, progress, target, unlocked_at)
      VALUES 
        (user_record.sender_id, 'favor_helper_10', 
         LEAST(favor_count, 10), 10,
         CASE WHEN favor_count >= 10 THEN NOW() ELSE NULL END)
      ON CONFLICT (user_id, achievement_type) 
      DO UPDATE SET 
        progress = EXCLUDED.progress,
        unlocked_at = COALESCE(achievements.unlocked_at, EXCLUDED.unlocked_at);
    END IF;
  END LOOP;
END $$;
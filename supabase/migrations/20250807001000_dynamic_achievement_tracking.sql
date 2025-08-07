-- Dynamic Achievement Tracking System
-- This migration creates a flexible achievement system that automatically tracks
-- achievements based on achievement_definitions without hardcoding

-- ============================================
-- 1. ADD EVENT TYPE MAPPING TO ACHIEVEMENT DEFINITIONS
-- ============================================

-- Add a column to map which event types trigger which achievements
ALTER TABLE achievement_definitions 
ADD COLUMN IF NOT EXISTS event_type text,
ADD COLUMN IF NOT EXISTS count_field text DEFAULT 'sender'; -- 'sender' or 'receiver'

-- Update existing achievement definitions with their event type mappings
UPDATE achievement_definitions SET 
  event_type = CASE 
    WHEN type LIKE 'appreciation_%' THEN 'APPRECIATION'
    WHEN type LIKE 'favor_helper_%' THEN 'FAVOR_COMPLETED'
    WHEN type LIKE 'wisdom_%' THEN 'WISDOM'
    WHEN type LIKE 'dont_panic_%' THEN 'DONT_PANIC'
    WHEN type LIKE 'ping_response_%' THEN 'PING_RESPONSE'
    WHEN type LIKE 'ping_%' AND type NOT LIKE 'ping_response_%' THEN 'PING'
    ELSE NULL
  END
WHERE event_type IS NULL;

-- ============================================
-- 2. CREATE DYNAMIC ACHIEVEMENT TRACKING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_achievement_progress()
RETURNS TRIGGER AS $$
DECLARE
  achievement_record RECORD;
  user_to_update UUID;
BEGIN
  -- Loop through all achievement definitions that match this event type
  FOR achievement_record IN 
    SELECT * FROM achievement_definitions 
    WHERE event_type = NEW.event_type::text
  LOOP
    -- Determine which user gets the achievement progress
    IF achievement_record.count_field = 'receiver' THEN
      user_to_update := NEW.receiver_id;
    ELSE
      user_to_update := NEW.sender_id;
    END IF;
    
    -- Insert or update achievement progress
    INSERT INTO achievements (user_id, achievement_type, progress, target)
    VALUES (user_to_update, achievement_record.type, 1, achievement_record.target)
    ON CONFLICT (user_id, achievement_type) 
    DO UPDATE SET progress = achievements.progress + 1;
    
    -- Check if achievement just got unlocked
    UPDATE achievements 
    SET unlocked_at = NOW()
    WHERE user_id = user_to_update
    AND achievement_type = achievement_record.type
    AND progress >= target 
    AND unlocked_at IS NULL;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. INSERT ALL ACHIEVEMENT DEFINITIONS WITH EVENT MAPPINGS
-- ============================================

INSERT INTO achievement_definitions (type, name, description, icon_name, target, reward_points, category, event_type, count_field) VALUES
  -- Appreciation Achievements (sent)
  ('appreciation_1', 'First Appreciation', 'Send your first appreciation', 'Heart', 1, 10, 'appreciation', 'APPRECIATION', 'sender'),
  ('appreciation_10', 'Gratitude Starter', 'Send 10 appreciations', 'Heart', 10, 20, 'appreciation', 'APPRECIATION', 'sender'),
  ('appreciation_25', 'Appreciation Enthusiast', 'Send 25 appreciations', 'Heart', 25, 40, 'appreciation', 'APPRECIATION', 'sender'),
  ('appreciation_50', 'Gratitude Expert', 'Send 50 appreciations', 'Heart', 50, 75, 'appreciation', 'APPRECIATION', 'sender'),
  ('appreciation_100', 'Gratitude Master', 'Send 100 appreciations', 'Crown', 100, 150, 'appreciation', 'APPRECIATION', 'sender'),
  
  -- Appreciation Achievements (received)
  ('appreciated_10', 'Well Appreciated', 'Receive 10 appreciations', 'Star', 10, 20, 'appreciation', 'APPRECIATION', 'receiver'),
  ('appreciated_50', 'Highly Valued', 'Receive 50 appreciations', 'Star', 50, 75, 'appreciation', 'APPRECIATION', 'receiver'),
  ('appreciated_100', 'Most Appreciated', 'Receive 100 appreciations', 'Star', 100, 150, 'appreciation', 'APPRECIATION', 'receiver'),
  
  -- Favor Achievements
  ('favor_helper_1', 'First Favor', 'Complete your first favor', 'HelpingHand', 1, 15, 'favor', 'FAVOR_COMPLETED', 'receiver'),
  ('favor_helper_10', 'Helpful Partner', 'Complete 10 favors', 'HelpingHand', 10, 50, 'favor', 'FAVOR_COMPLETED', 'receiver'),
  ('favor_helper_25', 'Super Helper', 'Complete 25 favors', 'HelpingHand', 25, 100, 'favor', 'FAVOR_COMPLETED', 'receiver'),
  
  -- Wisdom Achievements
  ('wisdom_1', 'Wisdom Seeker', 'Share your first piece of wisdom', 'BookOpen', 1, 10, 'wisdom', 'WISDOM', 'sender'),
  ('wisdom_10', 'Wisdom Keeper', 'Share 10 pieces of wisdom', 'BookOpen', 10, 25, 'wisdom', 'WISDOM', 'sender'),
  ('wisdom_25', 'Wisdom Guide', 'Share 25 pieces of wisdom', 'BookOpen', 25, 50, 'wisdom', 'WISDOM', 'sender'),
  ('wisdom_50', 'Wisdom Master', 'Share 50 pieces of wisdom', 'BookOpen', 50, 100, 'wisdom', 'WISDOM', 'sender'),
  
  -- Don't Panic Achievements
  ('dont_panic_1', 'Calm Presence', 'Send your first Don''t Panic message', 'Heart', 1, 10, 'communication', 'DONT_PANIC', 'sender'),
  ('dont_panic_5', 'Stress Reliever', 'Send 5 Don''t Panic messages', 'Heart', 5, 20, 'communication', 'DONT_PANIC', 'sender'),
  ('dont_panic_10', 'Peace Bringer', 'Send 10 Don''t Panic messages', 'Heart', 10, 35, 'communication', 'DONT_PANIC', 'sender'),
  ('dont_panic_25', 'Zen Master', 'Send 25 Don''t Panic messages', 'Heart', 25, 75, 'communication', 'DONT_PANIC', 'sender'),
  
  -- Ping Sent Achievements
  ('ping_1', 'First Check-in', 'Send your first Ping', 'MessageCircle', 1, 10, 'communication', 'PING', 'sender'),
  ('ping_10', 'Regular Checker', 'Send 10 Pings', 'MessageCircle', 10, 25, 'communication', 'PING', 'sender'),
  ('ping_25', 'Caring Companion', 'Send 25 Pings', 'MessageCircle', 25, 50, 'communication', 'PING', 'sender'),
  ('ping_50', 'Connection Champion', 'Send 50 Pings', 'MessageCircle', 50, 100, 'communication', 'PING', 'sender'),
  
  -- Ping Response Achievements
  ('ping_response_1', 'First Response', 'Respond to your first Ping', 'MessageCircle', 1, 10, 'communication', 'PING_RESPONSE', 'sender'),
  ('ping_response_10', 'Responsive Partner', 'Respond to 10 Pings', 'MessageCircle', 10, 25, 'communication', 'PING_RESPONSE', 'sender'),
  ('ping_response_25', 'Always There', 'Respond to 25 Pings', 'MessageCircle', 25, 50, 'communication', 'PING_RESPONSE', 'sender')
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  target = EXCLUDED.target,
  reward_points = EXCLUDED.reward_points,
  category = EXCLUDED.category,
  event_type = EXCLUDED.event_type,
  count_field = EXCLUDED.count_field;

-- ============================================
-- 4. BACKFILL ALL ACHIEVEMENTS BASED ON DEFINITIONS
-- ============================================

DO $$
DECLARE
  achievement_def RECORD;
  user_record RECORD;
  event_count INTEGER;
  user_to_update UUID;
BEGIN
  -- Loop through all achievement definitions that have an event_type
  FOR achievement_def IN 
    SELECT * FROM achievement_definitions 
    WHERE event_type IS NOT NULL
  LOOP
    -- Find all users who have relevant events
    FOR user_record IN 
      EXECUTE format(
        'SELECT DISTINCT %I as user_id FROM events WHERE event_type = %L',
        achievement_def.count_field || '_id',
        achievement_def.event_type
      )
    LOOP
      -- Count the events for this user
      EXECUTE format(
        'SELECT COUNT(*) FROM events WHERE %I = %L AND event_type = %L',
        achievement_def.count_field || '_id',
        user_record.user_id,
        achievement_def.event_type
      ) INTO event_count;
      
      IF event_count > 0 THEN
        -- Insert or update achievement progress
        INSERT INTO achievements (user_id, achievement_type, progress, target, unlocked_at)
        VALUES (
          user_record.user_id,
          achievement_def.type,
          LEAST(event_count, achievement_def.target),
          achievement_def.target,
          CASE WHEN event_count >= achievement_def.target THEN NOW() ELSE NULL END
        )
        ON CONFLICT (user_id, achievement_type) 
        DO UPDATE SET 
          progress = EXCLUDED.progress,
          unlocked_at = COALESCE(achievements.unlocked_at, EXCLUDED.unlocked_at);
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'All achievements backfilled based on achievement_definitions';
END $$;

-- ============================================
-- 5. CREATE HELPER FUNCTION TO ADD NEW ACHIEVEMENTS
-- ============================================

CREATE OR REPLACE FUNCTION add_achievement(
  p_type text,
  p_name text,
  p_description text,
  p_icon_name text,
  p_target integer,
  p_reward_points integer,
  p_category text,
  p_event_type text,
  p_count_field text DEFAULT 'sender'
) RETURNS void AS $$
BEGIN
  INSERT INTO achievement_definitions (
    type, name, description, icon_name, target, 
    reward_points, category, event_type, count_field
  ) VALUES (
    p_type, p_name, p_description, p_icon_name, p_target,
    p_reward_points, p_category, p_event_type, p_count_field
  )
  ON CONFLICT (type) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name,
    target = EXCLUDED.target,
    reward_points = EXCLUDED.reward_points,
    category = EXCLUDED.category,
    event_type = EXCLUDED.event_type,
    count_field = EXCLUDED.count_field;
    
  -- Backfill progress for this new achievement
  EXECUTE format(
    'INSERT INTO achievements (user_id, achievement_type, progress, target, unlocked_at)
     SELECT %I, %L, COUNT(*), %L, 
            CASE WHEN COUNT(*) >= %L THEN NOW() ELSE NULL END
     FROM events 
     WHERE event_type = %L
     GROUP BY %I
     HAVING COUNT(*) > 0
     ON CONFLICT (user_id, achievement_type) DO UPDATE SET
       progress = EXCLUDED.progress,
       unlocked_at = COALESCE(achievements.unlocked_at, EXCLUDED.unlocked_at)',
    p_count_field || '_id', p_type, p_target, p_target, p_event_type, p_count_field || '_id'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USAGE EXAMPLES
-- ============================================
-- Now you can easily add new achievements without modifying the function:
--
-- SELECT add_achievement(
--   'hornet_received_5', 
--   'Thick Skin', 
--   'Receive 5 hornets and keep going', 
--   'Shield', 
--   5, 
--   50, 
--   'resilience', 
--   'HORNET', 
--   'receiver'
-- );
--
-- Or update existing ones:
-- UPDATE achievement_definitions 
-- SET reward_points = 30, target = 15 
-- WHERE type = 'wisdom_10';
--
-- The tracking function will automatically adapt!
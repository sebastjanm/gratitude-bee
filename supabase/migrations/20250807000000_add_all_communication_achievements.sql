-- Complete Communication Achievements Migration
-- Adds Wisdom, Don't Panic, and Ping achievements with tracking

-- ============================================
-- 1. INSERT ALL ACHIEVEMENT DEFINITIONS
-- ============================================

INSERT INTO achievement_definitions (type, name, description, icon_name, target, reward_points, category) VALUES
  -- Wisdom Achievements
  ('wisdom_1', 'Wisdom Seeker', 'Share your first piece of wisdom', 'BookOpen', 1, 10, 'wisdom'),
  ('wisdom_10', 'Wisdom Keeper', 'Share 10 pieces of wisdom with your partner', 'BookOpen', 10, 25, 'wisdom'),
  ('wisdom_25', 'Wisdom Guide', 'Share 25 pieces of wisdom with your partner', 'BookOpen', 25, 50, 'wisdom'),
  ('wisdom_50', 'Wisdom Master', 'Share 50 pieces of wisdom with your partner', 'BookOpen', 50, 100, 'wisdom'),
  
  -- Don't Panic Achievements
  ('dont_panic_1', 'Calm Presence', 'Send your first Don''t Panic message', 'Heart', 1, 10, 'communication'),
  ('dont_panic_5', 'Stress Reliever', 'Send 5 Don''t Panic messages', 'Heart', 5, 20, 'communication'),
  ('dont_panic_10', 'Peace Bringer', 'Send 10 Don''t Panic messages', 'Heart', 10, 35, 'communication'),
  ('dont_panic_25', 'Zen Master', 'Send 25 Don''t Panic messages', 'Heart', 25, 75, 'communication'),
  
  -- Ping Sent Achievements
  ('ping_1', 'First Check-in', 'Send your first Ping', 'MessageCircle', 1, 10, 'communication'),
  ('ping_10', 'Regular Checker', 'Send 10 Pings to check on your partner', 'MessageCircle', 10, 25, 'communication'),
  ('ping_25', 'Caring Companion', 'Send 25 Pings to stay connected', 'MessageCircle', 25, 50, 'communication'),
  ('ping_50', 'Connection Champion', 'Send 50 Pings - always staying in touch', 'MessageCircle', 50, 100, 'communication'),
  
  -- Ping Response Achievements
  ('ping_response_1', 'First Response', 'Respond to your first Ping', 'MessageCircle', 1, 10, 'communication'),
  ('ping_response_10', 'Responsive Partner', 'Respond to 10 Pings', 'MessageCircle', 10, 25, 'communication'),
  ('ping_response_25', 'Always There', 'Respond to 25 Pings', 'MessageCircle', 25, 50, 'communication')
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  target = EXCLUDED.target,
  reward_points = EXCLUDED.reward_points,
  category = EXCLUDED.category;

-- ============================================
-- 2. UPDATE ACHIEVEMENT TRACKING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_achievement_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Appreciation achievements
  IF NEW.event_type = 'APPRECIATION' THEN
    INSERT INTO achievements (user_id, achievement_type, progress, target)
    VALUES 
      (NEW.sender_id, 'appreciation_10', 1, 10),
      (NEW.sender_id, 'appreciation_100', 1, 100)
    ON CONFLICT (user_id, achievement_type) 
    DO UPDATE SET progress = achievements.progress + 1;
    
    UPDATE achievements 
    SET unlocked_at = NOW()
    WHERE user_id = NEW.sender_id 
    AND progress >= target 
    AND unlocked_at IS NULL;
  END IF;

  -- Favor completion achievements
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

  -- Wisdom achievements
  IF NEW.event_type = 'WISDOM' THEN
    INSERT INTO achievements (user_id, achievement_type, progress, target)
    VALUES 
      (NEW.sender_id, 'wisdom_1', 1, 1),
      (NEW.sender_id, 'wisdom_10', 1, 10),
      (NEW.sender_id, 'wisdom_25', 1, 25),
      (NEW.sender_id, 'wisdom_50', 1, 50)
    ON CONFLICT (user_id, achievement_type) 
    DO UPDATE SET progress = achievements.progress + 1;
    
    UPDATE achievements 
    SET unlocked_at = NOW()
    WHERE user_id = NEW.sender_id 
    AND achievement_type IN ('wisdom_1', 'wisdom_10', 'wisdom_25', 'wisdom_50')
    AND progress >= target 
    AND unlocked_at IS NULL;
  END IF;

  -- Don't Panic achievements
  IF NEW.event_type = 'DONT_PANIC' THEN
    INSERT INTO achievements (user_id, achievement_type, progress, target)
    VALUES 
      (NEW.sender_id, 'dont_panic_1', 1, 1),
      (NEW.sender_id, 'dont_panic_5', 1, 5),
      (NEW.sender_id, 'dont_panic_10', 1, 10),
      (NEW.sender_id, 'dont_panic_25', 1, 25)
    ON CONFLICT (user_id, achievement_type) 
    DO UPDATE SET progress = achievements.progress + 1;
    
    UPDATE achievements 
    SET unlocked_at = NOW()
    WHERE user_id = NEW.sender_id 
    AND achievement_type IN ('dont_panic_1', 'dont_panic_5', 'dont_panic_10', 'dont_panic_25')
    AND progress >= target 
    AND unlocked_at IS NULL;
  END IF;

  -- Ping sent achievements
  IF NEW.event_type = 'PING' THEN
    INSERT INTO achievements (user_id, achievement_type, progress, target)
    VALUES 
      (NEW.sender_id, 'ping_1', 1, 1),
      (NEW.sender_id, 'ping_10', 1, 10),
      (NEW.sender_id, 'ping_25', 1, 25),
      (NEW.sender_id, 'ping_50', 1, 50)
    ON CONFLICT (user_id, achievement_type) 
    DO UPDATE SET progress = achievements.progress + 1;
    
    UPDATE achievements 
    SET unlocked_at = NOW()
    WHERE user_id = NEW.sender_id 
    AND achievement_type IN ('ping_1', 'ping_10', 'ping_25', 'ping_50')
    AND progress >= target 
    AND unlocked_at IS NULL;
  END IF;

  -- Ping response achievements
  IF NEW.event_type = 'PING_RESPONSE' THEN
    INSERT INTO achievements (user_id, achievement_type, progress, target)
    VALUES 
      (NEW.sender_id, 'ping_response_1', 1, 1),
      (NEW.sender_id, 'ping_response_10', 1, 10),
      (NEW.sender_id, 'ping_response_25', 1, 25)
    ON CONFLICT (user_id, achievement_type) 
    DO UPDATE SET progress = achievements.progress + 1;
    
    UPDATE achievements 
    SET unlocked_at = NOW()
    WHERE user_id = NEW.sender_id 
    AND achievement_type IN ('ping_response_1', 'ping_response_10', 'ping_response_25')
    AND progress >= target 
    AND unlocked_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. BACKFILL EXISTING DATA
-- ============================================

DO $$
DECLARE
  user_record RECORD;
  wisdom_count INTEGER;
  dont_panic_count INTEGER;
  ping_count INTEGER;
  ping_response_count INTEGER;
BEGIN
  -- Backfill Wisdom achievements
  FOR user_record IN SELECT DISTINCT sender_id FROM events WHERE event_type = 'WISDOM'
  LOOP
    SELECT COUNT(*) INTO wisdom_count
    FROM events
    WHERE sender_id = user_record.sender_id 
    AND event_type = 'WISDOM';

    IF wisdom_count > 0 THEN
      INSERT INTO achievements (user_id, achievement_type, progress, target, unlocked_at)
      VALUES 
        (user_record.sender_id, 'wisdom_1', 
         LEAST(wisdom_count, 1), 1,
         CASE WHEN wisdom_count >= 1 THEN NOW() ELSE NULL END),
        (user_record.sender_id, 'wisdom_10', 
         LEAST(wisdom_count, 10), 10,
         CASE WHEN wisdom_count >= 10 THEN NOW() ELSE NULL END),
        (user_record.sender_id, 'wisdom_25', 
         LEAST(wisdom_count, 25), 25,
         CASE WHEN wisdom_count >= 25 THEN NOW() ELSE NULL END),
        (user_record.sender_id, 'wisdom_50', 
         LEAST(wisdom_count, 50), 50,
         CASE WHEN wisdom_count >= 50 THEN NOW() ELSE NULL END)
      ON CONFLICT (user_id, achievement_type) 
      DO UPDATE SET 
        progress = EXCLUDED.progress,
        unlocked_at = COALESCE(achievements.unlocked_at, EXCLUDED.unlocked_at);
    END IF;
  END LOOP;

  -- Backfill Don't Panic achievements
  FOR user_record IN SELECT DISTINCT sender_id FROM events WHERE event_type = 'DONT_PANIC'
  LOOP
    SELECT COUNT(*) INTO dont_panic_count
    FROM events
    WHERE sender_id = user_record.sender_id 
    AND event_type = 'DONT_PANIC';

    IF dont_panic_count > 0 THEN
      INSERT INTO achievements (user_id, achievement_type, progress, target, unlocked_at)
      VALUES 
        (user_record.sender_id, 'dont_panic_1', 
         LEAST(dont_panic_count, 1), 1,
         CASE WHEN dont_panic_count >= 1 THEN NOW() ELSE NULL END),
        (user_record.sender_id, 'dont_panic_5', 
         LEAST(dont_panic_count, 5), 5,
         CASE WHEN dont_panic_count >= 5 THEN NOW() ELSE NULL END),
        (user_record.sender_id, 'dont_panic_10', 
         LEAST(dont_panic_count, 10), 10,
         CASE WHEN dont_panic_count >= 10 THEN NOW() ELSE NULL END),
        (user_record.sender_id, 'dont_panic_25', 
         LEAST(dont_panic_count, 25), 25,
         CASE WHEN dont_panic_count >= 25 THEN NOW() ELSE NULL END)
      ON CONFLICT (user_id, achievement_type) 
      DO UPDATE SET 
        progress = EXCLUDED.progress,
        unlocked_at = COALESCE(achievements.unlocked_at, EXCLUDED.unlocked_at);
    END IF;
  END LOOP;

  -- Backfill Ping achievements
  FOR user_record IN SELECT DISTINCT sender_id FROM events WHERE event_type = 'PING'
  LOOP
    SELECT COUNT(*) INTO ping_count
    FROM events
    WHERE sender_id = user_record.sender_id 
    AND event_type = 'PING';

    IF ping_count > 0 THEN
      INSERT INTO achievements (user_id, achievement_type, progress, target, unlocked_at)
      VALUES 
        (user_record.sender_id, 'ping_1', 
         LEAST(ping_count, 1), 1,
         CASE WHEN ping_count >= 1 THEN NOW() ELSE NULL END),
        (user_record.sender_id, 'ping_10', 
         LEAST(ping_count, 10), 10,
         CASE WHEN ping_count >= 10 THEN NOW() ELSE NULL END),
        (user_record.sender_id, 'ping_25', 
         LEAST(ping_count, 25), 25,
         CASE WHEN ping_count >= 25 THEN NOW() ELSE NULL END),
        (user_record.sender_id, 'ping_50', 
         LEAST(ping_count, 50), 50,
         CASE WHEN ping_count >= 50 THEN NOW() ELSE NULL END)
      ON CONFLICT (user_id, achievement_type) 
      DO UPDATE SET 
        progress = EXCLUDED.progress,
        unlocked_at = COALESCE(achievements.unlocked_at, EXCLUDED.unlocked_at);
    END IF;
  END LOOP;

  -- Backfill Ping Response achievements
  FOR user_record IN SELECT DISTINCT sender_id FROM events WHERE event_type = 'PING_RESPONSE'
  LOOP
    SELECT COUNT(*) INTO ping_response_count
    FROM events
    WHERE sender_id = user_record.sender_id 
    AND event_type = 'PING_RESPONSE';

    IF ping_response_count > 0 THEN
      INSERT INTO achievements (user_id, achievement_type, progress, target, unlocked_at)
      VALUES 
        (user_record.sender_id, 'ping_response_1', 
         LEAST(ping_response_count, 1), 1,
         CASE WHEN ping_response_count >= 1 THEN NOW() ELSE NULL END),
        (user_record.sender_id, 'ping_response_10', 
         LEAST(ping_response_count, 10), 10,
         CASE WHEN ping_response_count >= 10 THEN NOW() ELSE NULL END),
        (user_record.sender_id, 'ping_response_25', 
         LEAST(ping_response_count, 25), 25,
         CASE WHEN ping_response_count >= 25 THEN NOW() ELSE NULL END)
      ON CONFLICT (user_id, achievement_type) 
      DO UPDATE SET 
        progress = EXCLUDED.progress,
        unlocked_at = COALESCE(achievements.unlocked_at, EXCLUDED.unlocked_at);
    END IF;
  END LOOP;
  
  RAISE NOTICE 'All communication achievements added and backfilled successfully';
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Check new achievement definitions:
-- SELECT * FROM achievement_definitions WHERE category IN ('wisdom', 'communication');
--
-- Check user progress:
-- SELECT * FROM achievements WHERE achievement_type LIKE 'wisdom_%' OR achievement_type LIKE 'dont_panic_%' OR achievement_type LIKE 'ping_%';
--
-- Check which achievements are close to completion:
-- SELECT user_id, achievement_type, progress, target, 
--        ROUND((progress::numeric / target) * 100) as percent_complete
-- FROM achievements 
-- WHERE unlocked_at IS NULL 
-- AND (achievement_type LIKE 'wisdom_%' OR achievement_type LIKE 'dont_panic_%' OR achievement_type LIKE 'ping_%')
-- ORDER BY percent_complete DESC;
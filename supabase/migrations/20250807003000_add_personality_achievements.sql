-- Add Personality & Behavioral Achievements
-- These track HOW users interact, not just how much
-- Makes achievements fun, personal, and discoverable

-- ============================================
-- 1. TIME-BASED ACHIEVEMENTS
-- ============================================

INSERT INTO achievement_definitions (type, name, description, icon_name, target, reward_points, category, event_type, count_field) VALUES
  -- Time of day achievements
  ('night_owl', 'Night Owl', 'Send 5 appreciations after midnight', 'Moon', 5, 25, 'personality', NULL, 'sender'),
  ('early_bird', 'Early Bird', 'Send 5 appreciations before 7am', 'Sun', 5, 25, 'personality', NULL, 'sender'),
  ('lunch_break_hero', 'Lunch Break Hero', 'Send 10 appreciations between 12-1pm', 'Coffee', 10, 20, 'personality', NULL, 'sender'),
  
  -- Day of week achievements  
  ('weekend_warrior', 'Weekend Warrior', 'Send 20 appreciations on weekends', 'Calendar', 20, 30, 'personality', NULL, 'sender'),
  ('monday_motivation', 'Monday Motivation', 'Send appreciations 5 Mondays in a row', 'Zap', 5, 35, 'personality', NULL, 'sender'),
  ('friday_feeling', 'Friday Feeling', 'Send 10 appreciations on Fridays', 'PartyPopper', 10, 25, 'personality', NULL, 'sender'),
  
  -- Streak & comeback achievements
  ('comeback_kid', 'Comeback Kid', 'Return after 30+ day break', 'RefreshCw', 1, 50, 'resilience', NULL, 'sender'),
  ('daily_streak_7', 'Week Streak', 'Use app 7 days in a row', 'Fire', 7, 40, 'streak', NULL, 'sender'),
  ('daily_streak_30', 'Monthly Streak', 'Use app 30 days in a row', 'Flame', 30, 100, 'streak', NULL, 'sender'),
  ('consistent_month', 'Consistent', 'Active at least 20 days in a month', 'Target', 20, 60, 'streak', NULL, 'sender')
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  target = EXCLUDED.target,
  reward_points = EXCLUDED.reward_points,
  category = EXCLUDED.category;

-- ============================================
-- 2. PATTERN-BASED ACHIEVEMENTS  
-- ============================================

INSERT INTO achievement_definitions (type, name, description, icon_name, target, reward_points, category, event_type, count_field) VALUES
  -- Variety achievements
  ('variety_pack', 'Variety Pack', 'Use 5 different appreciation categories in one day', 'Palette', 5, 30, 'personality', NULL, 'sender'),
  ('explorer', 'Explorer', 'Try all appreciation categories', 'Compass', 8, 40, 'personality', NULL, 'sender'),
  ('balanced_giver', 'Balanced Giver', 'Send and receive 25+ each', 'Scale', 25, 50, 'balance', NULL, 'sender'),
  
  -- Speed achievements
  ('quick_response', 'Quick Response', 'Respond to 10 events within 1 hour', 'Zap', 10, 35, 'personality', NULL, 'sender'),
  ('morning_ritual', 'Morning Ritual', 'Send appreciation within 30 min of waking (10 times)', 'Coffee', 10, 30, 'personality', NULL, 'sender'),
  
  -- Special moments
  ('first_of_month', 'Monthly Starter', 'Send appreciation on the 1st of the month (3 months)', 'Calendar', 3, 25, 'personality', NULL, 'sender'),
  ('holiday_spirit', 'Holiday Spirit', 'Active on 5 holidays', 'Gift', 5, 40, 'personality', NULL, 'sender'),
  ('anniversary', 'Anniversary', 'Use app on your join date anniversary', 'Heart', 1, 50, 'special', NULL, 'sender')
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  target = EXCLUDED.target,
  reward_points = EXCLUDED.reward_points,
  category = EXCLUDED.category;

-- ============================================
-- 3. RELATIONSHIP DYNAMIC ACHIEVEMENTS
-- ============================================

INSERT INTO achievement_definitions (type, name, description, icon_name, target, reward_points, category, event_type, count_field) VALUES
  -- Interaction patterns
  ('conversation_starter', 'Conversation Starter', 'First to send appreciation 20 times', 'MessageSquare', 20, 30, 'personality', NULL, 'sender'),
  ('gratitude_chain', 'Gratitude Chain', 'Exchange appreciations back-and-forth 10 times in a day', 'Link', 10, 35, 'personality', NULL, 'sender'),
  ('supportive_partner', 'Supportive Partner', 'Send Don''t Panic after partner''s Hornet (5 times)', 'Shield', 5, 40, 'balance', NULL, 'sender'),
  
  -- Fun/Quirky
  ('emoji_lover', 'Emoji Lover', 'Add reactions to 50 events', 'Smile', 50, 25, 'personality', NULL, 'sender'),
  ('wordsmith', 'Wordsmith', 'Send 10 custom appreciation messages', 'PenTool', 10, 30, 'personality', NULL, 'sender'),
  ('minimalist', 'Minimalist', 'Send 20 appreciations without custom text', 'Minus', 20, 20, 'personality', NULL, 'sender')
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  target = EXCLUDED.target,
  reward_points = EXCLUDED.reward_points,
  category = EXCLUDED.category;

-- ============================================
-- 4. CREATE TRACKING FUNCTION FOR COMPLEX ACHIEVEMENTS
-- ============================================

-- Note: These complex achievements need custom tracking logic
-- They can't be tracked by simple event counting
-- You'll need to create scheduled functions or triggers to check:
-- - Time-based conditions (night_owl, early_bird)
-- - Streak calculations (daily_streak_7, comeback_kid)
-- - Pattern matching (variety_pack, gratitude_chain)

CREATE OR REPLACE FUNCTION check_special_achievements()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Example: Check for Night Owl achievement
  FOR user_record IN 
    SELECT DISTINCT sender_id 
    FROM events 
    WHERE event_type = 'APPRECIATION'
  LOOP
    -- Count appreciations sent after midnight
    INSERT INTO achievements (user_id, achievement_type, progress, target)
    SELECT 
      user_record.sender_id,
      'night_owl',
      COUNT(*),
      5
    FROM events
    WHERE sender_id = user_record.sender_id
    AND event_type = 'APPRECIATION'
    AND EXTRACT(HOUR FROM created_at) >= 0
    AND EXTRACT(HOUR FROM created_at) < 6
    ON CONFLICT (user_id, achievement_type)
    DO UPDATE SET progress = EXCLUDED.progress;
    
    -- Check for Early Bird
    INSERT INTO achievements (user_id, achievement_type, progress, target)
    SELECT 
      user_record.sender_id,
      'early_bird',
      COUNT(*),
      5
    FROM events
    WHERE sender_id = user_record.sender_id
    AND event_type = 'APPRECIATION'
    AND EXTRACT(HOUR FROM created_at) >= 5
    AND EXTRACT(HOUR FROM created_at) < 7
    ON CONFLICT (user_id, achievement_type)
    DO UPDATE SET progress = EXCLUDED.progress;
    
    -- Check for Weekend Warrior
    INSERT INTO achievements (user_id, achievement_type, progress, target)
    SELECT 
      user_record.sender_id,
      'weekend_warrior',
      COUNT(*),
      20
    FROM events
    WHERE sender_id = user_record.sender_id
    AND event_type = 'APPRECIATION'
    AND EXTRACT(DOW FROM created_at) IN (0, 6)  -- Sunday = 0, Saturday = 6
    ON CONFLICT (user_id, achievement_type)
    DO UPDATE SET progress = EXCLUDED.progress;
  END LOOP;
  
  -- Mark achievements as unlocked when target reached
  UPDATE achievements
  SET unlocked_at = NOW()
  WHERE unlocked_at IS NULL
  AND progress >= target
  AND achievement_type IN ('night_owl', 'early_bird', 'weekend_warrior');
END;
$$ LANGUAGE plpgsql;

-- Run the check immediately to backfill
SELECT check_special_achievements();

-- ============================================
-- 5. SCHEDULE PERIODIC CHECKS (Optional)
-- ============================================
-- You could set up a cron job to run check_special_achievements() daily
-- Or call it after certain events

-- ============================================
-- QUERY TO SEE ALL PERSONALITY ACHIEVEMENTS
-- ============================================
-- SELECT * FROM achievement_definitions 
-- WHERE category IN ('personality', 'streak', 'balance', 'special')
-- ORDER BY category, name;
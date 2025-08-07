-- Clean, Meaningful Achievements - Working Within Existing System
-- Replaces overwhelming 27 achievements with focused milestones
-- No system changes required - uses existing dynamic tracking

-- ============================================
-- 1. CLEAN UP EXISTING ACHIEVEMENTS
-- ============================================

-- Delete in correct order to respect foreign key constraints
-- 1. First delete achievement progress records
DELETE FROM achievements;

-- 2. Delete reward logs
DELETE FROM achievement_rewards_log;

-- 3. Finally delete the definitions
DELETE FROM achievement_definitions;

-- ============================================
-- 2. INSERT MEANINGFUL ACHIEVEMENTS
-- ============================================

-- Use UPSERT to handle existing records
INSERT INTO achievement_definitions (type, name, description, icon_name, target, reward_points, category, event_type, count_field) VALUES

-- APPRECIATION JOURNEY (Sender) - Clear progression path
('first_step', 'First Step', 'Send your first appreciation', 'Heart', 1, 10, 'appreciation', 'APPRECIATION', 'sender'),
('gratitude_week', 'Week of Gratitude', 'Send 7 appreciations', 'Calendar', 7, 25, 'appreciation', 'APPRECIATION', 'sender'),
('monthly_habit', 'Monthly Habit', 'Send 30 appreciations', 'Target', 30, 50, 'appreciation', 'APPRECIATION', 'sender'),
('gratitude_expert', 'Gratitude Expert', 'Send 100 appreciations', 'Star', 100, 100, 'appreciation', 'APPRECIATION', 'sender'),
('gratitude_master', 'Year of Gratitude', 'Send 365 appreciations', 'Crown', 365, 500, 'appreciation', 'APPRECIATION', 'sender'),

-- BEING APPRECIATED (Receiver) - Feel valued
('feeling_loved', 'Feeling Loved', 'Receive 3 appreciations', 'Heart', 3, 15, 'appreciation', 'APPRECIATION', 'receiver'),
('well_loved', 'Well Loved', 'Receive 10 appreciations', 'Heart', 10, 30, 'appreciation', 'APPRECIATION', 'receiver'),
('highly_valued', 'Highly Valued', 'Receive 50 appreciations', 'Star', 50, 75, 'appreciation', 'APPRECIATION', 'receiver'),
('most_appreciated', 'Most Appreciated', 'Receive 100 appreciations', 'Trophy', 100, 150, 'appreciation', 'APPRECIATION', 'receiver'),

-- HELPING (Favors) - Both directions
('first_help', 'First Help', 'Complete your first favor', 'HelpingHand', 1, 15, 'favor', 'FAVOR_COMPLETED', 'receiver'),
('helpful_partner', 'Helpful Partner', 'Complete 5 favors', 'HelpingHand', 5, 35, 'favor', 'FAVOR_COMPLETED', 'receiver'),
('reliable_helper', 'Reliable Helper', 'Complete 10 favors', 'HelpingHand', 10, 50, 'favor', 'FAVOR_COMPLETED', 'receiver'),
('favor_champion', 'Favor Champion', 'Complete 25 favors', 'Trophy', 25, 100, 'favor', 'FAVOR_COMPLETED', 'receiver'),

-- ASKING FOR HELP (Important for balance)
('first_request', 'It''s OK to Ask', 'Request your first favor', 'MessageCircle', 1, 10, 'favor', 'FAVOR_REQUEST', 'sender'),
('comfortable_asking', 'Comfortable Asking', 'Request 5 favors', 'MessageCircle', 5, 25, 'favor', 'FAVOR_REQUEST', 'sender'),

-- WISDOM & SUPPORT
('wisdom_sharer', 'Wisdom Sharer', 'Share 5 pieces of wisdom', 'BookOpen', 5, 20, 'wisdom', 'WISDOM', 'sender'),
('wisdom_keeper', 'Wisdom Keeper', 'Share 20 pieces of wisdom', 'BookOpen', 20, 50, 'wisdom', 'WISDOM', 'sender'),
('calm_presence', 'Calm Presence', 'Send 5 Don''t Panic messages', 'Heart', 5, 25, 'communication', 'DONT_PANIC', 'sender'),

-- STAYING CONNECTED
('first_ping', 'Checking In', 'Send your first ping', 'MessageCircle', 1, 10, 'communication', 'PING', 'sender'),
('regular_checker', 'Regular Checker', 'Send 10 pings', 'MessageCircle', 10, 25, 'communication', 'PING', 'sender'),
('always_connected', 'Always Connected', 'Send 30 pings', 'MessageCircle', 30, 50, 'communication', 'PING', 'sender'),

-- RESPONDING
('first_response', 'Quick Response', 'Respond to your first ping', 'MessageCircle', 1, 10, 'communication', 'PING_RESPONSE', 'sender'),
('responsive_partner', 'Responsive Partner', 'Respond to 10 pings', 'MessageCircle', 10, 30, 'communication', 'PING_RESPONSE', 'sender')
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
-- 3. BACKFILL PROGRESS FOR NEW ACHIEVEMENTS
-- ============================================

DO $$
DECLARE
  achievement_def RECORD;
  user_record RECORD;
  event_count INTEGER;
BEGIN
  -- Loop through all achievement definitions
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
  
  -- Distribute rewards for any newly unlocked achievements
  UPDATE achievements
  SET unlocked_at = NOW()
  WHERE unlocked_at IS NULL
  AND progress >= target;
  
  RAISE NOTICE 'Achievement cleanup complete. Total achievements: %', 
    (SELECT COUNT(*) FROM achievement_definitions);
END $$;

-- ============================================
-- 4. SUMMARY OF NEW ACHIEVEMENT STRUCTURE
-- ============================================
-- Total: 23 achievements (down from 27)
-- 
-- Appreciation: 9 (5 sending, 4 receiving)
-- Favors: 6 (4 completing, 2 requesting)
-- Wisdom: 2 
-- Communication: 6 (Don't Panic, Pings, Responses)
--
-- Clear progression paths:
-- - Starter (1) → Week (7) → Month (30) → Expert (100) → Master (365)
-- - Balanced between giving and receiving
-- - Meaningful milestones that feel achievable
--
-- Point structure:
-- - First time: 10-15 points
-- - Early milestones: 25-35 points
-- - Medium goals: 50-75 points
-- - Major achievements: 100-150 points
-- - Ultimate: 500 points

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Check the new achievements:
-- SELECT category, COUNT(*) as count, SUM(reward_points) as total_points
-- FROM achievement_definitions
-- GROUP BY category
-- ORDER BY category;

-- See user progress:
-- SELECT u.display_name, COUNT(a.id) as total, 
--        SUM(CASE WHEN a.unlocked_at IS NOT NULL THEN 1 ELSE 0 END) as unlocked
-- FROM users u
-- LEFT JOIN achievements a ON u.id = a.user_id
-- GROUP BY u.id, u.display_name;
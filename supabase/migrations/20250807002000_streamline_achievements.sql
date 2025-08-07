-- Streamline Achievements - Keep Only Essential Ones
-- This reduces cognitive overload and makes achievements more meaningful

-- Remove overwhelming number of achievements, keeping only key milestones
DELETE FROM achievement_definitions 
WHERE type IN (
  -- Remove intermediate appreciation milestones
  'appreciation_25',
  'appreciation_50',
  'appreciation_500',
  'appreciated_50',
  
  -- Remove too many wisdom tiers
  'wisdom_25',
  'wisdom_50',
  
  -- Remove intermediate don't panic
  'dont_panic_5',
  'dont_panic_25',
  
  -- Remove intermediate ping tiers  
  'ping_25',
  'ping_50',
  'ping_response_25',
  
  -- Remove intermediate favor tier
  'favor_helper_25'
);

-- Update remaining achievements with better progression
UPDATE achievement_definitions SET
  reward_points = CASE
    -- First-time achievements: 10 points
    WHEN target = 1 THEN 10
    -- Early milestone (10): 30 points
    WHEN target = 10 THEN 30
    -- Major milestone (100): 100 points
    WHEN target = 100 THEN 100
    ELSE reward_points
  END;

-- Final streamlined list (only 13 achievements):
-- APPRECIATION (4):
--   - appreciation_1: First Appreciation (10 pts)
--   - appreciation_10: Getting Started (30 pts)
--   - appreciation_100: Dedication (100 pts)
--   - appreciated_10: Well Appreciated (30 pts)
--   - appreciated_100: Highly Valued (100 pts)
--
-- FAVORS (2):
--   - favor_helper_1: First Helper (10 pts)
--   - favor_helper_10: Reliable Partner (30 pts)
--
-- WISDOM (2):
--   - wisdom_1: First Wisdom (10 pts)
--   - wisdom_10: Wisdom Keeper (30 pts)
--
-- COMMUNICATION (4):
--   - dont_panic_1: First Support (10 pts)
--   - dont_panic_10: Stress Reliever (30 pts)
--   - ping_1: First Check-in (10 pts)
--   - ping_10: Stay Connected (30 pts)
--   - ping_response_1: First Response (10 pts)
--   - ping_response_10: Always There (30 pts)

-- Clean up orphaned achievement progress
DELETE FROM achievements 
WHERE achievement_type NOT IN (
  SELECT type FROM achievement_definitions
);

-- Optional: Add one special "completionist" achievement
INSERT INTO achievement_definitions (
  type, name, description, icon_name, target, 
  reward_points, category, event_type, count_field
) VALUES (
  'getting_started', 
  'Getting Started', 
  'Complete 5 different achievement types',
  'Trophy', 
  5, 
  50, 
  'special',
  NULL,  -- Manual tracking
  'sender'
) ON CONFLICT (type) DO NOTHING;
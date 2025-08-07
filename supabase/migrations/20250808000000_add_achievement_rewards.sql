-- Achievement Rewards Distribution System
-- This migration adds automatic reward distribution when achievements are unlocked

-- ============================================
-- 1. CREATE REWARDS LOG TABLE (Optional but recommended for tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS achievement_rewards_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  points_awarded INTEGER NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT achievement_rewards_log_unique UNIQUE(user_id, achievement_type)
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_achievement_rewards_user_id ON achievement_rewards_log(user_id);

-- ============================================
-- 2. CREATE REWARD DISTRIBUTION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION distribute_achievement_reward()
RETURNS TRIGGER AS $$
DECLARE
  reward_amount INTEGER;
  achievement_name TEXT;
  existing_reward RECORD;
BEGIN
  -- Only process if achievement just unlocked (unlocked_at changed from NULL to NOT NULL)
  IF NEW.unlocked_at IS NOT NULL AND OLD.unlocked_at IS NULL THEN
    
    -- Check if reward already distributed (safety check)
    SELECT * INTO existing_reward 
    FROM achievement_rewards_log 
    WHERE user_id = NEW.user_id 
    AND achievement_type = NEW.achievement_type;
    
    IF existing_reward IS NOT NULL THEN
      -- Reward already distributed, skip
      RETURN NEW;
    END IF;
    
    -- Get reward amount and name from achievement_definitions
    SELECT reward_points, name INTO reward_amount, achievement_name
    FROM achievement_definitions
    WHERE type = NEW.achievement_type;
    
    -- Only proceed if there's a reward to give
    IF reward_amount IS NOT NULL AND reward_amount > 0 THEN
      
      -- Add bonus points to user's favor_points
      UPDATE wallets
      SET favor_points = favor_points + reward_amount,
          updated_at = NOW()
      WHERE user_id = NEW.user_id;
      
      -- Log the reward distribution
      INSERT INTO achievement_rewards_log (user_id, achievement_type, points_awarded)
      VALUES (NEW.user_id, NEW.achievement_type, reward_amount);
      
      -- Create notification for user (matching exact schema)
      INSERT INTO notifications (
        recipient_id, 
        sender_id, 
        type, 
        content
      )
      VALUES (
        NEW.user_id,
        NEW.user_id,  -- Self notification
        'ACHIEVEMENT_UNLOCKED',
        jsonb_build_object(
          'achievement_type', NEW.achievement_type,
          'achievement_name', achievement_name,
          'reward_points', reward_amount,
          'title', 'Achievement Unlocked!',
          'message', format('Congratulations! You unlocked "%s" and earned %s favor points!', 
                           achievement_name, reward_amount)
        )
      );
      
      RAISE NOTICE 'Achievement reward distributed: % points for % to user %', 
                   reward_amount, NEW.achievement_type, NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. CREATE TRIGGER FOR REWARD DISTRIBUTION
-- ============================================
DROP TRIGGER IF EXISTS distribute_achievement_reward_trigger ON achievements;

CREATE TRIGGER distribute_achievement_reward_trigger
AFTER UPDATE ON achievements
FOR EACH ROW
EXECUTE FUNCTION distribute_achievement_reward();

-- ============================================
-- 4. BACKFILL REWARDS FOR EXISTING UNLOCKED ACHIEVEMENTS
-- ============================================
DO $$
DECLARE
  achievement_record RECORD;
  reward_amount INTEGER;
  achievement_name TEXT;
  rewards_distributed INTEGER := 0;
BEGIN
  -- Find all unlocked achievements that haven't been rewarded yet
  FOR achievement_record IN 
    SELECT a.user_id, a.achievement_type, a.unlocked_at, ad.reward_points, ad.name
    FROM achievements a
    JOIN achievement_definitions ad ON a.achievement_type = ad.type
    WHERE a.unlocked_at IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM achievement_rewards_log arl 
      WHERE arl.user_id = a.user_id 
      AND arl.achievement_type = a.achievement_type
    )
  LOOP
    -- Only process if there's a reward to give
    IF achievement_record.reward_points IS NOT NULL AND achievement_record.reward_points > 0 THEN
      
      -- Add rewards to wallet
      UPDATE wallets
      SET favor_points = favor_points + achievement_record.reward_points,
          updated_at = NOW()
      WHERE user_id = achievement_record.user_id;
      
      -- Log the retroactive reward
      INSERT INTO achievement_rewards_log (
        user_id, 
        achievement_type, 
        points_awarded,
        awarded_at
      )
      VALUES (
        achievement_record.user_id, 
        achievement_record.achievement_type, 
        achievement_record.reward_points,
        achievement_record.unlocked_at  -- Use original unlock time
      );
      
      -- Create notification for retroactive reward (matching exact schema)
      INSERT INTO notifications (
        recipient_id, 
        sender_id, 
        type, 
        content
      )
      VALUES (
        achievement_record.user_id,
        achievement_record.user_id,
        'ACHIEVEMENT_UNLOCKED',
        jsonb_build_object(
          'achievement_type', achievement_record.achievement_type,
          'achievement_name', achievement_record.name,
          'reward_points', achievement_record.reward_points,
          'title', 'Achievement Rewards Added!',
          'message', format('You''ve been awarded %s favor points for your "%s" achievement!', 
                           achievement_record.reward_points, achievement_record.name),
          'is_retroactive', true
        )
      );
      
      rewards_distributed := rewards_distributed + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Backfill complete: % achievement rewards distributed', rewards_distributed;
END $$;

-- ============================================
-- 5. ADD RLS POLICIES FOR REWARDS LOG TABLE
-- ============================================
ALTER TABLE achievement_rewards_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own reward history
CREATE POLICY "Users can view their own reward history"
ON achievement_rewards_log FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Only system can insert rewards (via trigger)
CREATE POLICY "Only system can insert rewards"
ON achievement_rewards_log FOR INSERT
TO postgres
WITH CHECK (true);

-- ============================================
-- 6. GRANT NECESSARY PERMISSIONS
-- ============================================
GRANT SELECT ON achievement_rewards_log TO authenticated;
GRANT ALL ON achievement_rewards_log TO postgres;

-- ============================================
-- VERIFICATION QUERIES (Run these after migration)
-- ============================================
-- Check if rewards were distributed:
-- SELECT * FROM achievement_rewards_log;
-- 
-- Check updated favor points:
-- SELECT user_id, favor_points FROM wallets WHERE user_id IN (
--   SELECT DISTINCT user_id FROM achievements WHERE unlocked_at IS NOT NULL
-- );
--
-- Check notifications created:
-- SELECT * FROM notifications WHERE type = 'ACHIEVEMENT_UNLOCKED';
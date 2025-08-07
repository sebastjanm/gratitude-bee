# Achievement Rewards Implementation Plan

**Status:** Not Started  
**Priority:** High  
**Complexity:** Medium  
**Dependencies:** Rewards system (completed)

## Overview

While achievements are being tracked and displayed, the bonus point rewards defined in `achievement_definitions` are not being automatically credited to user wallets. This plan outlines implementing automatic reward distribution when achievements are unlocked.

## ⚠️ Database Analysis Complete

After thorough analysis of existing infrastructure (see `/docs/db-schema/existing-achievement-infrastructure.md`), we've confirmed:

### Safe to Implement (No Conflicts):
✅ New function `distribute_achievement_reward()` - no existing reward functions  
✅ New trigger on `achievements` table - no existing triggers there  
✅ New notification type `ACHIEVEMENT_UNLOCKED` - not currently defined  
✅ Optional rewards log table - doesn't exist  

### Will NOT Interfere With:
- `update_achievement_progress()` function (tracks progress)
- `handle_event_points()` function (handles event points)
- Existing triggers on `events` table
- Current wallet point calculations

## Current State (Based on Database Analysis)

### ✅ Existing Infrastructure:
- **Tables:** achievements, achievement_definitions, wallets, notifications
- **Functions:** update_achievement_progress(), handle_event_points()
- **Triggers:** update_achievement_progress_trigger (on events), on_event_change (on events)
- **Wallet Fields:** favor_points (integer), appreciation_points (JSONB by category)
- **Achievement Tracking:** Working correctly via triggers

### ❌ What's Missing (Confirmed Safe to Add):
- Function to distribute rewards when achievements unlock
- Trigger on achievements table (AFTER UPDATE)
- ACHIEVEMENT_UNLOCKED notification type
- Reward distribution tracking/logging
- Backfill for existing unlocked achievements

## Implementation Tasks

### Phase 1: Automatic Reward Distribution

#### 1.1 Create Reward Distribution Function
```sql
CREATE OR REPLACE FUNCTION distribute_achievement_reward()
RETURNS TRIGGER AS $$
DECLARE
  reward_amount INTEGER;
  achievement_name TEXT;
BEGIN
  -- Only process if achievement just unlocked (unlocked_at changed from NULL)
  IF NEW.unlocked_at IS NOT NULL AND OLD.unlocked_at IS NULL THEN
    
    -- Get reward amount and name from achievement_definitions
    SELECT reward_points, name INTO reward_amount, achievement_name
    FROM achievement_definitions
    WHERE type = NEW.achievement_type;
    
    -- Add bonus points to user's wallet (favor_points or separate bonus_points field)
    UPDATE wallets
    SET favor_points = favor_points + COALESCE(reward_amount, 0),
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Create notification for user
    INSERT INTO notifications (recipient_id, sender_id, type, content, created_at)
    VALUES (
      NEW.user_id,
      NEW.user_id,  -- Self notification
      'ACHIEVEMENT_UNLOCKED',
      jsonb_build_object(
        'achievement_type', NEW.achievement_type,
        'achievement_name', achievement_name,
        'reward_points', reward_amount,
        'message', format('Congratulations! You unlocked "%s" and earned %s bonus points!', 
                         achievement_name, reward_amount)
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on achievements table
CREATE TRIGGER distribute_achievement_reward_trigger
AFTER UPDATE ON achievements
FOR EACH ROW
EXECUTE FUNCTION distribute_achievement_reward();
```

#### 1.2 Add Rewards Tracking Table (Optional)
```sql
CREATE TABLE achievement_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  achievement_type TEXT REFERENCES achievement_definitions(type),
  points_awarded INTEGER NOT NULL,
  awarded_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);
```

### Phase 2: Wallet Structure Decision

#### ✅ RECOMMENDED: Use Existing favor_points
**Rationale:** Based on database analysis, this is the safest approach
- No schema changes needed
- favor_points already displayed in UI
- Simplest implementation
- Users can spend achievement rewards on favors

#### Alternative Options (Not Recommended):
- Add bonus_points column (requires schema change and UI updates)
- Use appreciation_points JSONB (complex, meant for category tracking)
- Create new column (unnecessary complexity)

### Phase 3: Frontend Updates

#### 3.1 Achievement Unlock Notification
- Listen for `ACHIEVEMENT_UNLOCKED` notifications
- Display toast/modal with celebration
- Show reward amount
- Add animation effects

#### 3.2 Update Points Display
```typescript
// In rewards.tsx, show total bonus points earned
const { data: walletData } = await supabase
  .from('wallets')
  .select('favor_points, bonus_points') // or however we store it
  .eq('user_id', user.id)
  .single();
```

#### 3.3 Achievement Card Enhancement
- Show "Claimed ✓" badge for rewarded achievements
- Display reward amount more prominently
- Add claim animation

### Phase 4: Testing & Validation

#### 4.1 Test Scenarios
- [ ] New achievement unlock credits points
- [ ] Duplicate unlock doesn't double-reward
- [ ] Notification appears correctly
- [ ] Points reflect in wallet immediately
- [ ] Historical achievements can be retroactively rewarded

#### 4.2 Backfill Existing Unlocked Achievements
```sql
-- One-time script to reward already unlocked achievements
DO $$
DECLARE
  achievement_record RECORD;
  reward_amount INTEGER;
BEGIN
  FOR achievement_record IN 
    SELECT a.*, ad.reward_points 
    FROM achievements a
    JOIN achievement_definitions ad ON a.achievement_type = ad.type
    WHERE a.unlocked_at IS NOT NULL
  LOOP
    -- Add rewards for already unlocked achievements
    UPDATE wallets
    SET favor_points = favor_points + COALESCE(achievement_record.reward_points, 0)
    WHERE user_id = achievement_record.user_id;
    
    -- Log the retroactive reward
    INSERT INTO achievement_rewards (user_id, achievement_type, points_awarded)
    VALUES (achievement_record.user_id, achievement_record.achievement_type, 
            achievement_record.reward_points)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
```

## Implementation Steps (Updated Based on Analysis)

### Step 1: Database Migration File
Create: `supabase/migrations/[timestamp]_add_achievement_rewards.sql`

**Components to Add:**
1. `distribute_achievement_reward()` function (NEW - no conflicts)
2. `distribute_achievement_reward_trigger` on achievements table (NEW - no existing triggers there)
3. Optional: `achievement_rewards_log` table for tracking (NEW)
4. Backfill script for existing unlocked achievements

**Will Use:**
- Existing `wallets.favor_points` for reward storage
- Existing `notifications` table for unlock notifications

### Step 2: Notification System
1. Ensure notification type 'ACHIEVEMENT_UNLOCKED' is handled
2. Add notification listener in app
3. Create notification UI component

### Step 3: Frontend Updates
1. Update wallet queries to include bonus points
2. Add celebration modal/toast component
3. Enhance achievement cards with reward info
4. Update points display to show bonus points

### Step 4: Testing & Deployment
1. Test in development environment
2. Run backfill script for existing achievements
3. Deploy to production
4. Monitor for issues

## Success Metrics

- All unlocked achievements have distributed rewards
- Users receive notifications for new unlocks
- Bonus points correctly added to wallets
- No duplicate rewards for same achievement
- Positive user feedback on reward system

## Implementation Safety Checklist

### Pre-Implementation Verification
```sql
-- Run these checks before implementing:

-- 1. Verify no existing triggers on achievements table
SELECT * FROM pg_trigger WHERE tgrelid = 'achievements'::regclass;

-- 2. Verify no reward-related functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%reward%';

-- 3. Check current wallet structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'wallets';

-- 4. Verify achievement_definitions has reward_points
SELECT * FROM achievement_definitions LIMIT 1;
```

### Security Considerations
- ✅ Only postgres role can execute reward distribution (via trigger)
- ✅ RLS policies prevent users from modifying achievements directly
- ✅ Unique constraint prevents double-claiming
- ✅ Reward amounts validated from definitions table

### Performance Considerations
- Trigger is lightweight (simple UPDATE and INSERT)
- Runs AFTER UPDATE, won't block achievement tracking
- No complex calculations or external calls
- Indexes already exist on relevant columns

## Future Enhancements

1. **Tiered Rewards**: Bronze/Silver/Gold versions with increasing rewards
2. **Streak Bonuses**: Extra rewards for consecutive achievements
3. **Limited Time Events**: Double reward periods
4. **Achievement Shop**: Spend achievement points on special items
5. **Leaderboards**: Compare achievement points with others
6. **Badge Display**: Visual badges on user profile
7. **Share Achievements**: Social media integration

## Simplified Implementation Path

Based on database analysis, the implementation is simpler than initially planned:

### Quick Win Implementation (2-3 hours):
1. **Database (30 min):** Single migration file with reward distribution function and trigger
2. **Testing (30 min):** Verify trigger works with test achievement unlock
3. **Backfill (15 min):** Run script for existing achievements
4. **Frontend (1 hour):** Add notification handler for ACHIEVEMENT_UNLOCKED
5. **UI Polish (30 min):** Toast/celebration when achievement unlocks

### Full Implementation (4-5 hours):
- All of above plus:
- Rewards log table for audit trail
- Detailed celebration animations
- Sound effects and haptic feedback
- Achievement sharing functionality

## Summary

With the database analysis complete, we've confirmed:
- **No conflicts** with existing infrastructure
- **Safe to implement** all proposed features  
- **Simpler than expected** - can use existing wallet structure
- **Quick win possible** in 2-3 hours for basic functionality

The plan is ready for implementation with confidence that nothing will be duplicated or broken.
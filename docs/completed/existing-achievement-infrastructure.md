# Existing Achievement Infrastructure Analysis

## Summary
Analysis of existing database structures to avoid duplication when implementing achievement rewards.

## Existing Components

### 1. Tables
✅ **achievements** - Tracks user achievement progress
✅ **achievement_definitions** - Defines achievement metadata and rewards
✅ **wallets** - Stores user points (multiple types)
✅ **notifications** - Stores user notifications

### 2. Functions & Triggers

#### Achievement Tracking
✅ **Function:** `update_achievement_progress()`
- Location: `20250806000000_create_achievement_tracking.sql`
- Purpose: Updates achievement progress when events occur
- Trigger: `update_achievement_progress_trigger` on `events` table (AFTER INSERT)

#### Points Management
✅ **Function:** `handle_event_points()`
- Location: `20240706143000_initial_schema.sql`
- Purpose: Updates wallet points when events occur
- Trigger: `on_event_change` on `events` table (AFTER INSERT OR UPDATE)

#### User Creation
✅ **Function:** `handle_new_user()`
- Creates user profile and wallet on signup

#### Push Notifications
✅ **Function:** `send_push_notification()`
- Trigger: `trigger_send_push_notification` on `events` table

### 3. Wallet Structure
```sql
wallets {
  user_id: uuid (PK)
  appreciation_points: jsonb  -- Category-based points {"category": points}
  favor_points: integer       -- Used for favors
  hornet_stings: integer     
  wisdom_points: integer     
  ping_points: integer       
  dont_panic_points: integer
  updated_at: timestamp
}
```

### 4. Notification Types
Currently handled notification types in `send-notification/index.ts`:
- APPRECIATION
- FAVOR_REQUEST
- FAVOR_ACCEPTED
- FAVOR_DECLINED
- FAVOR_COMPLETED
- PING
- PING_RESPONSE
- WISDOM
- HORNET

**Missing:** ACHIEVEMENT_UNLOCKED

### 5. RLS Policies
✅ Achievements table has RLS policies
✅ Only postgres role can modify achievements (via triggers)
✅ Users can view their own and partner's achievements

## What's Missing for Achievement Rewards

### 1. Reward Distribution
❌ No function to distribute rewards when achievements unlock
❌ No trigger on achievements table for AFTER UPDATE
❌ No tracking of distributed rewards

### 2. Bonus Points Storage
Options:
- **Option A:** Use existing `favor_points` (simplest, no schema change)
- **Option B:** Add new `bonus_points` column to wallets
- **Option C:** Add to `appreciation_points` JSONB with key 'achievement_rewards'

### 3. Notification for Unlocks
❌ No ACHIEVEMENT_UNLOCKED notification type
❌ No trigger to create notifications when achievements unlock

### 4. Reward Tracking
❌ No table to track which rewards have been claimed
❌ No way to prevent double-claiming

## Recommended Implementation (No Duplicates)

### 1. New Function: `distribute_achievement_reward()`
- Trigger: AFTER UPDATE on `achievements` table
- Only fires when `unlocked_at` changes from NULL to NOT NULL
- Updates `wallets.favor_points` (or new field)
- Creates notification record

### 2. New Table: `achievement_rewards_log` (Optional)
```sql
CREATE TABLE achievement_rewards_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  achievement_type TEXT,
  points_awarded INTEGER,
  awarded_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);
```

### 3. Extend Notifications
- Add 'ACHIEVEMENT_UNLOCKED' to notification handling
- Include achievement details in notification content

## Conflicts to Avoid

1. **Don't modify** `update_achievement_progress()` - it's working correctly
2. **Don't create duplicate triggers** on events table
3. **Don't interfere** with existing point calculations in `handle_event_points()`
4. **Check trigger execution order** if adding new triggers on same table

## Safe Implementation Path

1. Create new migration file with:
   - `distribute_achievement_reward()` function
   - Trigger on achievements table (AFTER UPDATE)
   - Optional: achievement_rewards_log table

2. Update wallet points:
   - Safest: Add to `favor_points` (no schema change)
   - Alternative: Add `bonus_points` column

3. Handle notifications:
   - Insert into existing notifications table
   - Add ACHIEVEMENT_UNLOCKED type handling in app

4. Backfill existing unlocked achievements:
   - One-time script to reward already unlocked achievements
   - Use achievement_rewards_log to prevent double-claiming

## Database Integrity Checks

Before implementation, verify:
```sql
-- Check existing triggers on achievements table
SELECT * FROM pg_trigger WHERE tgrelid = 'achievements'::regclass;

-- Check existing triggers on events table  
SELECT * FROM pg_trigger WHERE tgrelid = 'events'::regclass;

-- Check if any reward distribution exists
SELECT proname FROM pg_proc WHERE proname LIKE '%reward%';
```

## Conclusion

The infrastructure for achievements is solid, but reward distribution is completely missing. We can safely add:
1. A new trigger on achievements table
2. A function to distribute rewards
3. Notifications for unlocks
4. Optional logging table

No existing functionality will be duplicated or broken.
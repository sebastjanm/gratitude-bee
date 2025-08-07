# Achievement System Documentation

## Overview
The achievement system is now fully dynamic, automatically tracking achievements based on the `achievement_definitions` table without requiring code changes.

## Database Schema

### achievement_definitions Table
```sql
CREATE TABLE public.achievement_definitions (
  type text NOT NULL PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  target integer NOT NULL,
  reward_points integer DEFAULT 0,
  category text NOT NULL,
  event_type text,              -- NEW: Which event triggers this achievement
  count_field text DEFAULT 'sender'  -- NEW: Count for 'sender' or 'receiver'
);
```

### achievements Table
```sql
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id),
  achievement_type text NOT NULL,
  unlocked_at timestamp without time zone,
  progress integer DEFAULT 0,
  target integer NOT NULL,
  UNIQUE(user_id, achievement_type)
);
```

### achievement_rewards_log Table
```sql
CREATE TABLE public.achievement_rewards_log (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id),
  achievement_type text NOT NULL,
  points_awarded integer NOT NULL,
  awarded_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);
```

## Key Functions

### update_achievement_progress()
- **Type**: Trigger function
- **Trigger**: `update_achievement_progress_trigger` on `events` table (AFTER INSERT)
- **Purpose**: Dynamically tracks achievement progress based on achievement_definitions
- **How it works**:
  1. Looks up achievements matching the event type
  2. Updates progress for the appropriate user (sender or receiver)
  3. Marks achievement as unlocked when target is reached

### distribute_achievement_reward()
- **Type**: Trigger function
- **Trigger**: `distribute_achievement_reward_trigger` on `achievements` table (AFTER UPDATE)
- **Purpose**: Distributes favor points when achievements are unlocked
- **How it works**:
  1. Fires when `unlocked_at` changes from NULL
  2. Adds reward_points to user's favor_points
  3. Logs reward in achievement_rewards_log
  4. Creates notification for user

### add_achievement()
- **Type**: Helper function
- **Purpose**: Easy way to add new achievements with automatic backfilling
- **Parameters**:
  - p_type: Unique identifier
  - p_name: Display name
  - p_description: What the user needs to do
  - p_icon_name: Icon to display (e.g., 'Heart', 'Star', 'BookOpen')
  - p_target: Number of events needed
  - p_reward_points: Favor points awarded
  - p_category: Category for grouping
  - p_event_type: Which event triggers this (e.g., 'APPRECIATION', 'WISDOM')
  - p_count_field: 'sender' or 'receiver' (default: 'sender')

## Event Type Mappings

| Event Type | Achievements | Count Field |
|------------|--------------|-------------|
| APPRECIATION | appreciation_*, appreciated_* | sender/receiver |
| FAVOR_COMPLETED | favor_helper_* | receiver |
| WISDOM | wisdom_* | sender |
| DONT_PANIC | dont_panic_* | sender |
| PING | ping_* | sender |
| PING_RESPONSE | ping_response_* | sender |
| HORNET | Can be added | sender/receiver |

## Adding New Achievements

### Method 1: Using the Helper Function
```sql
SELECT add_achievement(
  'wisdom_100',                    -- type (unique ID)
  'Wisdom Sage',                   -- name
  'Share 100 pieces of wisdom',    -- description
  'BookOpen',                       -- icon_name
  100,                              -- target
  200,                              -- reward_points
  'wisdom',                         -- category
  'WISDOM',                         -- event_type
  'sender'                          -- count_field
);
```

### Method 2: Direct Insert
```sql
INSERT INTO achievement_definitions (
  type, name, description, icon_name, target, 
  reward_points, category, event_type, count_field
) VALUES (
  'helper_50', 'Ultimate Helper', 'Complete 50 favors', 
  'HelpingHand', 50, 150, 'favor', 'FAVOR_COMPLETED', 'receiver'
);
```

### Method 3: Bulk Insert
```sql
INSERT INTO achievement_definitions (type, name, description, icon_name, target, reward_points, category, event_type, count_field) VALUES
  ('daily_user', 'Daily User', 'Use the app 30 days', 'Calendar', 30, 100, 'streak', NULL, 'sender'),
  ('power_couple', 'Power Couple', 'Exchange 500 total events', 'Heart', 500, 500, 'milestone', NULL, 'sender');
```

## Modifying Existing Achievements

```sql
-- Change reward points
UPDATE achievement_definitions 
SET reward_points = 75 
WHERE type = 'wisdom_25';

-- Change target
UPDATE achievement_definitions 
SET target = 15, description = 'Share 15 pieces of wisdom' 
WHERE type = 'wisdom_10';

-- Change which user gets credit
UPDATE achievement_definitions 
SET count_field = 'receiver' 
WHERE type = 'appreciation_100';
```

## Icon Names (for Lucide React Native)

Common icons used in achievements:
- Heart, Star, Trophy, Crown
- BookOpen (wisdom)
- MessageCircle (communication)
- HelpingHand (favors)
- Calendar (streaks)
- Shield (resilience)
- Fire, Flame (streaks)
- Target, TrendingUp (progress)

## Categories

Current categories:
- `appreciation` - Sending/receiving appreciations
- `favor` - Completing favors
- `wisdom` - Sharing wisdom
- `communication` - Pings, Don't Panic messages
- `milestone` - Major milestones
- `streak` - Consecutive actions
- `resilience` - Handling challenges

## Backfilling

When adding new achievements, the system automatically:
1. Counts existing events matching the criteria
2. Sets appropriate progress values
3. Marks as unlocked if already achieved
4. Distributes rewards for completed achievements

## Testing Queries

```sql
-- View all achievement definitions
SELECT * FROM achievement_definitions ORDER BY category, target;

-- Check user's achievement progress
SELECT 
  ad.name,
  ad.category,
  a.progress || '/' || a.target as progress,
  CASE WHEN a.unlocked_at IS NOT NULL THEN 'Unlocked' ELSE 'In Progress' END as status,
  ad.reward_points
FROM achievements a
JOIN achievement_definitions ad ON a.achievement_type = ad.type
WHERE a.user_id = '[user_id]'
ORDER BY a.unlocked_at DESC NULLS LAST;

-- See achievements close to completion
SELECT 
  u.display_name,
  ad.name,
  a.progress || '/' || a.target as progress,
  ROUND((a.progress::numeric / a.target) * 100) as percent
FROM achievements a
JOIN achievement_definitions ad ON a.achievement_type = ad.type
JOIN users u ON a.user_id = u.id
WHERE a.unlocked_at IS NULL
AND (a.progress::numeric / a.target) >= 0.75
ORDER BY percent DESC;
```

## Key Benefits of Dynamic System

1. **No Code Changes Required**: Add/modify achievements through database only
2. **Automatic Tracking**: Function reads from definitions table
3. **Flexible**: Easy to add new event types and categories
4. **Backfilling**: Automatically counts historical data
5. **Maintainable**: All achievement logic in one place
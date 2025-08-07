# Gratitude Bee Points System

## How Points Work

Gratitude Bee uses a points-based economy to encourage positive interactions between partners. Think of it like a game where being kind, helpful, and supportive earns you rewards!

## Your Points Wallet

Every user has a digital wallet that tracks different types of points. Each type serves a unique purpose:

### 🎁 Appreciation Points
- **What they are:** Points you earn when your partner sends you appreciation badges
- **How they work:** Each category (kindness, humor, support, etc.) has its own balance
- **Example:** If you receive a "Great Cook" badge worth 3 points, your "support" category gets +3 points

### ⭐ Favor Points  
- **What they are:** The main currency for requesting help from your partner
- **Starting balance:** Everyone begins with 20 favor points
- **How to earn more:**
  - Complete favors for your partner (+5-10 points per favor)
  - Unlock achievements (+10-100 points depending on the achievement)
- **How to spend:** Use them to request favors from your partner

### 🧠 Wisdom Points
- **What they are:** Points earned when your partner shares wisdom or advice with you
- **Purpose:** Tracks how much guidance you've received

### 🏓 Ping Points
- **What they are:** Points for responding to check-ins from your partner
- **Note:** Response feature coming soon!

### 🛡️ Don't Panic Points
- **What they are:** Points earned when your partner sends calming messages during stressful times
- **Purpose:** Recognizes emotional support

### 🐝 Hornet Stings
- **What they are:** Negative feedback that both tracks criticism AND deducts favor points
- **Economic impact:** Each Hornet sting removes favor points from the receiver
  - Light misunderstanding: -10 favor points
  - Not OK behavior: -25 favor points  
  - Major issue (clusterfuck): -30 favor points
- **Protection:** Your favor points can't go below 0, even with multiple stings
- **Tracking:** Stings accumulate as negative values (e.g., -47 total stings)
- **Purpose:** Creates real consequences for negative behavior while maintaining accountability

## How Different Actions Work

### Sending Appreciation
1. You choose a badge to send to your partner
2. Your partner receives the points for that badge
3. They get a notification celebrating the appreciation

### The Favor System
The favor system has three steps to ensure fairness:

1. **Request:** You spend favor points to request help
2. **Accept/Decline:** Your partner decides if they can help
3. **Complete:** After they help, you mark it complete and they earn points

This way, both partners benefit - you get help when needed, and your partner earns points for being helpful!

### Achievement Rewards
Achievements are special milestones that unlock automatically as you use the app:

#### Starter Achievements (10-25 points)
- **First Appreciation:** Send your very first appreciation badge
- **Appreciation Pioneer:** Send 10 appreciations
- **Favor Helper:** Complete your first favor

#### Intermediate Achievements (50 points)  
- **Appreciation Champion:** Send 50 appreciations
- **Favor Master:** Complete 10 favors
- **Communication Pro:** Regular message exchanges

#### Major Milestones (100 points)
- **100 Appreciations Sent:** A true appreciation expert!
- **100 Appreciations Received:** Much loved and appreciated
- **Favor Centurion:** Complete 100 favors

When you unlock an achievement:
- Favor points are automatically added to your wallet
- You receive a celebration notification
- The achievement shows as unlocked in your rewards tab

### Special Messages

#### Wisdom Messages
When your partner shares relationship wisdom or life advice, you earn wisdom points. It's a way to value the guidance and experience shared in your relationship.

#### Don't Panic Messages  
During stressful moments, these calming messages earn you Don't Panic points, recognizing the emotional support your partner provides.

#### Ping Messages
Quick check-ins to see how you're doing. Soon you'll be able to respond and earn points for staying connected!

### Hornet Stings (Negative Feedback)
Hornets are the app's way to communicate criticism or frustration:

1. **Immediate Impact:** When you receive a Hornet, it deducts favor points from your wallet
2. **Deduction Amounts by Severity:**
   - Light misunderstanding: 10 favor points deducted
   - Not OK behavior: 25 favor points deducted
   - Major issue (clusterfuck): 30 favor points deducted
3. **Protection:** Your favor points can't drop below 0, preventing debt
4. **Tracking:** Total stings accumulate as negative values (more negative = more stings received)

This creates a balanced economy where positive actions (favors, achievements) build your currency, while negative behavior has real consequences.

## The Philosophy Behind Points

The points system isn't about competition - it's about:
- **Recognition:** Making kindness visible and celebrated
- **Balance:** Ensuring both partners contribute to the relationship
- **Motivation:** Encouraging regular positive interactions
- **Fun:** Adding a playful element to daily relationship maintenance

## Technical Notes for Developers

### Security & Integrity
- All point values are stored server-side in template tables
- Clients only send template IDs, never point values directly  
- Points are calculated by database triggers (`handle_event_points`, `distribute_achievement_reward`)
- Every transaction is logged in the events table for complete audit trail
- Row Level Security (RLS) ensures users can only view their own and partner's data

### Core Database Tables

#### Events Table (Immutable Ledger)
```sql
events {
  id: bigint (auto-increment)
  sender_id: uuid -> users.id
  receiver_id: uuid -> users.id  
  event_type: enum (APPRECIATION, FAVOR_REQUEST, FAVOR_COMPLETED, etc.)
  status: enum (PENDING, ACCEPTED, DECLINED, COMPLETED)
  content: jsonb (contains template_id, points, category, etc.)
  reaction: text (emoji reactions)
  created_at: timestamp
}
```

#### Wallets Table (Current Balances)
```sql
wallets {
  user_id: uuid (PK) -> users.id
  appreciation_points: jsonb  -- {"kindness": 10, "humor": 5, ...}
  favor_points: integer       -- Default: 20
  hornet_stings: integer     -- Default: 0
  wisdom_points: integer     -- Default: 0
  ping_points: integer       -- Default: 0
  dont_panic_points: integer -- Default: 0
  updated_at: timestamp
}
```

#### Achievement Tables
```sql
achievement_definitions {
  type: text (PK)
  name: text
  description: text
  icon_name: text
  target: integer
  reward_points: integer  -- Favor points awarded
  category: text
}

achievements {
  id: uuid (PK)
  user_id: uuid -> users.id
  achievement_type: text -> achievement_definitions.type
  progress: integer
  target: integer
  unlocked_at: timestamp (NULL until unlocked)
}

achievement_rewards_log {
  id: uuid (PK)
  user_id: uuid -> users.id
  achievement_type: text
  points_awarded: integer
  awarded_at: timestamp
  UNIQUE(user_id, achievement_type)  -- Prevents double rewards
}
```

#### Template Tables (Point Values)
```sql
appreciation_templates {
  id: text (PK)
  category_id: text
  title: text
  points: integer (default: 1)
  notification_text: text
}

favor_templates {
  id: text (PK)
  category_id: text
  title: text
  points: integer (default: 5)
}

-- Similar structure for wisdom_templates, ping_templates, etc.
```

### Key Database Functions & Triggers

#### 1. Event Points Handler
```sql
-- Function: handle_event_points()
-- Trigger: on_event_change (AFTER INSERT OR UPDATE on events)
-- Purpose: Updates wallet balances when events occur
-- Logic:
  - Looks up point values from template tables
  - Updates receiver's wallet based on event type
  - For appreciations: adds to appreciation_points JSONB by category
  - For completed favors: adds to favor_points
  - For hornets: deducts from favor_points AND increments hornet_stings
  - For other events: updates respective point fields
  - Favor points protected from going below 0
```

#### 2. Achievement Progress Tracker
```sql
-- Function: update_achievement_progress()  
-- Trigger: update_achievement_progress_trigger (AFTER INSERT on events)
-- Purpose: Tracks achievement progress automatically
-- Logic:
  - Counts relevant events for each achievement type
  - Updates progress in achievements table
  - Sets unlocked_at when target is reached
  - Only processes if achievement not already unlocked
```

#### 3. Achievement Reward Distributor
```sql
-- Function: distribute_achievement_reward()
-- Trigger: distribute_achievement_reward_trigger (AFTER UPDATE on achievements)
-- Purpose: Grants favor points when achievements unlock
-- Logic:
  - Fires when unlocked_at changes from NULL to NOT NULL
  - Looks up reward_points from achievement_definitions
  - Adds points to user's favor_points balance
  - Logs reward in achievement_rewards_log (prevents duplicates)
  - Creates ACHIEVEMENT_UNLOCKED notification
```

#### 4. User Initialization
```sql
-- Function: handle_new_user()
-- Trigger: on_auth_user_created (AFTER INSERT on auth.users)
-- Purpose: Creates user profile and wallet
-- Logic:
  - Creates entry in public.users table
  - Creates wallet with 20 initial favor_points
  - Generates unique invite code
```

### Data Flow Examples

#### Appreciation Flow
1. Client sends: `{template_id: "kind_words", category_id: "kindness"}`
2. Server creates event: `{type: "APPRECIATION", content: {template_id, category_id}}`
3. Trigger `handle_event_points` fires:
   - Looks up points from appreciation_templates
   - Updates receiver's appreciation_points["kindness"] += points
4. Trigger `update_achievement_progress` fires:
   - Increments appreciation-related achievement progress

#### Favor Completion Flow
1. User marks favor as complete
2. Event updated: `{type: "FAVOR_COMPLETED", status: "COMPLETED"}`
3. Trigger `handle_event_points` fires:
   - Looks up points from favor_templates
   - Updates completer's favor_points += points
4. Achievement progress updates for favor-related achievements

#### Achievement Unlock Flow
1. Achievement progress reaches target
2. `unlocked_at` timestamp is set
3. Trigger `distribute_achievement_reward` fires:
   - Adds reward_points to user's favor_points
   - Creates achievement_rewards_log entry
   - Sends notification to user

#### Hornet Sting Flow
1. User sends Hornet to partner
2. Event created: `{type: "HORNET", content: {template_id}}`
3. Trigger `handle_event_points` fires:
   - Looks up points from hornet_templates (stored as negative values: -10, -25, -30)
   - Calculates deduction using ABS(points) to get positive deduction amount
   - Deducts that amount from receiver's favor_points
   - Ensures favor_points doesn't go below 0 using GREATEST(0, ...)
   - Adds negative value to receiver's hornet_stings counter (accumulates as negative)
4. Receiver sees reduced favor points and increased negative sting count

### RLS Policies Overview
- Users can view their own wallet and their partner's
- Only system (postgres role) can modify wallets via triggers
- Achievement progress visible to user and partner
- Achievement rewards log only visible to owner
- Events visible to sender, receiver, and their partners

### Performance Optimizations
- Wallets table provides denormalized view for fast reads
- JSONB indexes on appreciation_points for category queries
- Triggers run AFTER operations to avoid blocking
- Achievement checking only on relevant event types
- Unique constraints prevent duplicate processing

### Testing Queries for Developers
```sql
-- Check user's complete point balance
SELECT * FROM wallets WHERE user_id = '[user_id]';

-- View achievement progress
SELECT a.*, ad.name, ad.reward_points 
FROM achievements a
JOIN achievement_definitions ad ON a.achievement_type = ad.type
WHERE a.user_id = '[user_id]';

-- Audit trail for favor points earned
SELECT * FROM events 
WHERE receiver_id = '[user_id]' 
AND event_type = 'FAVOR_COMPLETED';

-- Check if achievement rewards were distributed
SELECT * FROM achievement_rewards_log 
WHERE user_id = '[user_id]';
```

This architecture ensures the system remains secure, consistent, and performant while maintaining a complete history of all interactions. For detailed schema information, see `/docs/db-schema/gratitude-db schema.sql`.
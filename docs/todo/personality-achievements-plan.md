# Personality-Based Achievements Plan

## Goal
Create engaging, discoverable achievements that track HOW users interact, not just how much. These should feel fun, personal, and encourage healthy relationship patterns.

## Categories of Personality Achievements

### 1. Time-Based Patterns 🕐
Track WHEN users are active to reveal their habits:

| Achievement | Description | Tracking Logic | Reward |
|------------|-------------|----------------|---------|
| Night Owl | Send 5 appreciations between midnight-4am | `EXTRACT(HOUR FROM created_at) BETWEEN 0 AND 3` | 25 pts |
| Early Bird | Send 5 appreciations between 5-7am | `EXTRACT(HOUR FROM created_at) BETWEEN 5 AND 6` | 25 pts |
| Lunch Break Hero | Send 10 appreciations 12-1pm | `EXTRACT(HOUR FROM created_at) = 12` | 20 pts |
| Weekend Warrior | 20 appreciations on weekends | `EXTRACT(DOW FROM created_at) IN (0,6)` | 30 pts |
| Monday Motivation | Appreciate on 5 consecutive Mondays | Complex: track Monday streaks | 35 pts |

### 2. Consistency & Streaks 🔥
Reward regular engagement without pressure:

| Achievement | Description | Tracking Logic | Reward |
|------------|-------------|----------------|---------|
| Daily Streak 7 | Active 7 days in a row | Track consecutive days with events | 40 pts |
| Daily Streak 30 | Active 30 days in a row | Track consecutive days with events | 100 pts |
| Comeback Kid | Return after 30+ day break | Gap analysis between events | 50 pts |
| Consistent Month | Active 20+ days in any month | Count distinct days per month | 60 pts |
| Regular Routine | Same time (±1hr) for 10 days | Track event time consistency | 30 pts |

### 3. Interaction Variety 🎨
Encourage exploring all features:

| Achievement | Description | Tracking Logic | Reward |
|------------|-------------|----------------|---------|
| Variety Pack | Use 5 different categories in one day | Count distinct categories per day | 30 pts |
| Explorer | Try all 8 appreciation categories | Count lifetime distinct categories | 40 pts |
| Full Spectrum | Use all event types in a week | APPRECIATION, FAVOR, WISDOM, PING, etc. | 50 pts |
| Category Master | 10+ in each category | Track per-category counts | 60 pts |

### 4. Relationship Balance ⚖️
Promote healthy two-way interactions:

| Achievement | Description | Tracking Logic | Reward |
|------------|-------------|----------------|---------|
| Balanced Giver | Send AND receive 50+ each | `sent >= 50 AND received >= 50` | 50 pts |
| Support System | Complete 10 favors AND request 10 | Track both directions of favors | 45 pts |
| Equal Exchange | 1:1 ratio maintained for 30 days | Calculate give/receive ratio | 60 pts |
| Gratitude Tennis | Back-and-forth 10 times in a day | Track response patterns | 35 pts |
| Quick Responder | Respond within 1hr (20 times) | Track time between events | 30 pts |

### 5. Special Moments 🎉
Celebrate milestones and special occasions:

| Achievement | Description | Tracking Logic | Reward |
|------------|-------------|----------------|---------|
| Anniversary | Active on account creation date | Check if date matches join date | 50 pts |
| Holiday Spirit | Active on 5 holidays | Check against holiday calendar | 40 pts |
| First of Month | Start 3 months strong | Active on 1st day of month | 25 pts |
| Milestone 100 | Reach 100 total interactions | Count all events | 75 pts |
| Year One | Active for full year | Account age check | 200 pts |

### 6. Communication Style 💬
Recognize different interaction styles:

| Achievement | Description | Tracking Logic | Reward |
|------------|-------------|----------------|---------|
| Wordsmith | Write 20 custom messages | Check for custom text in events | 30 pts |
| Emoji Master | Add 50 reactions | Count reaction updates | 25 pts |
| Conversation Starter | Initiate 30 interactions | First event of the day analysis | 30 pts |
| Supportive Partner | Send comfort after criticism | Don't Panic after Hornet (5x) | 40 pts |
| Minimalist | 20 appreciations without text | Check for empty custom text | 20 pts |

## Implementation Approach

### Phase 1: Simple Time-Based (Can implement now)
- Night Owl, Early Bird, Weekend Warrior
- Use `check_special_achievements()` function
- Run daily via cron or after events

### Phase 2: Streak Tracking (Requires state tracking)
- Daily/Monthly streaks
- Comeback Kid
- Need to track last_active_date per user

### Phase 3: Complex Patterns (Requires analysis)
- Balanced Giver
- Support System  
- Gratitude Tennis
- Need to analyze event relationships

### Phase 4: Special Events (Requires calendar)
- Holiday Spirit
- Anniversary
- Need holiday calendar table

## Technical Considerations

### 1. Performance
- Complex achievements should be calculated async
- Consider materialized views for heavy queries
- Batch process during low-usage times

### 2. Storage
- Some achievements need tracking tables:
  ```sql
  CREATE TABLE user_streaks (
    user_id UUID,
    current_streak INT,
    longest_streak INT,
    last_active_date DATE
  );
  ```

### 3. Triggers vs Scheduled Jobs
- **Immediate**: Simple counts (appreciation_sent)
- **Scheduled**: Complex patterns (balanced_giver)
- **Hybrid**: Streaks (update on event, check daily)

### 4. Testing
Each achievement needs:
- Clear detection logic
- Backfill capability
- Progress visibility
- Unlock notification

## Priority Order

### Must Have (Launch)
1. Time-based: Night Owl, Early Bird, Weekend Warrior
2. Simple streaks: 7-day, 30-day
3. Variety: Explorer, Variety Pack
4. Balance: Balanced Giver

### Nice to Have (Phase 2)
1. Comeback Kid
2. Support System
3. Conversation patterns
4. Special moments

### Future Ideas
1. Seasonal achievements
2. Challenge achievements
3. Partner achievements (both must participate)
4. Hidden achievements (discover by doing)

## Success Metrics
- User engagement with achievements tab
- Achievement unlock rate
- Impact on daily active users
- User feedback on fun factor

## Questions to Resolve

1. **Retroactive unlocks?** Should we backfill when adding new achievements?
2. **Notification frequency?** Batch achievement unlocks or immediate?
3. **Hidden achievements?** Some discoveries or all visible?
4. **Partner achievements?** Require both users to participate?
5. **Time zones?** Use user's local time or UTC?
6. **Reset achievements?** Annual? Never? Optional?

## Next Steps

1. Review and prioritize achievements
2. Decide on Phase 1 achievements (10-15 max)
3. Create migration for chosen achievements
4. Implement tracking functions
5. Test with sample data
6. Add UI indicators for "close to unlock"
7. Launch and monitor
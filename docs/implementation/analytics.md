# Gratitude Bee - Analytics Implementation

This document describes how analytics work in Gratitude Bee. All analytics calculations are performed by a Supabase database function called `get_user_analytics`.

## Data Source

Analytics data comes from the `events` table which stores all user interactions including:
- Appreciations (with category_id)
- Favors
- Pings
- Hornets
- Wisdom shares

## Implementation

The analytics feature uses:
- **Frontend**: `app/(more)/analytics.tsx` - displays analytics data
- **Backend**: Supabase RPC function `get_user_analytics(p_user_id uuid, p_period text)`

## Time Periods

Users can filter analytics by:
- **Today**: Current day only
- **Week**: Current week (Monday to Sunday)
- **Month**: Current calendar month
- **All Time**: All historical data

## Calculated Metrics

### Main Stats
1. **Total Sent**: Count of events where user is sender_id
2. **Total Received**: Count of events where user is receiver_id
3. **Current Streak**: Consecutive days of sending appreciations (calculated from all-time data, shows 0 if last appreciation was more than 1 day ago)
4. **Longest Streak**: Maximum consecutive days of sending appreciations ever achieved
5. **Daily Average**: Total sent divided by number of days in the period

### Category Stats
Shows breakdown by appreciation category:
- **Sent count**: How many times user sent each category
- **Received count**: How many times user received each category

### Time-Based Breakdowns
Different visualizations based on selected period:
- **Today**: Hourly breakdown
- **Week**: Daily breakdown
- **Month**: Weekly breakdown
- **All Time**: Monthly breakdown

### Insights (varies by period)
- **Most Active Day**: Day of week with most sent events (not shown for 'today')
- **Your Favorite**: Category you send most often
- **Partner's Favorite**: Category you receive most often
- **Balance Score**: Ratio of sent to received as percentage (min/max * 100)

## Data Flow

1. User opens Analytics screen
2. Frontend calls `supabase.rpc('get_user_analytics', { p_user_id, p_period })`
3. Database function queries events table with date filters
4. Function calculates all metrics server-side
5. Returns JSON with main_stats, category_stats, breakdown_data, and insights
6. Frontend displays the formatted data

## Performance

All calculations happen in the database via SQL, which is efficient even for large datasets. The frontend only handles display formatting.
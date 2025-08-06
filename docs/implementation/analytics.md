# Gratitude Bee - Analytics Implementation

This document describes the analytics feature in Gratitude Bee. Analytics calculations are performed by a Supabase database function called `get_user_analytics`.

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

Users can filter analytics by selecting one of four time periods:
- **Today**: Current day only
- **Week**: Current week (Monday to Sunday)
- **Month**: Current calendar month
- **All Time**: All historical data

## Displayed Metrics

### Main Stats (4 metric cards)
1. **Total Sent**: Count of all events where user is sender_id
2. **Total Received**: Count of all events where user is receiver_id
3. **Current Streak**: Consecutive days of sending appreciations (shows "X days" with subtitle showing best streak)
4. **Daily Average**: Average number of events sent per day in the selected period

### Category Breakdown
Shows a list of all appreciation categories with:
- **Category name** with colored indicator
- **Sent count**: Number of times user sent this category
- **Received count**: Number of times user received this category

## Data Flow

1. User opens Analytics screen (defaults to 'month' view)
2. User can switch between time periods using filter buttons
3. Frontend calls `supabase.rpc('get_user_analytics', { p_user_id, p_period })`
4. Database function queries events table with date filters
5. Function calculates metrics server-side
6. Returns JSON with `main_stats` and `category_stats`
7. Frontend displays the data in cards and lists

## UI Components

- **Header**: Back button, chart icon, title "Analytics & Progress"
- **Filter buttons**: 4 period options with icons (Clock, Calendar, CalendarRange, Infinity)
- **Stats Grid**: 2x2 grid of metric cards with icons and values
- **Category List**: Vertical list of categories with sent/received counts

## Performance

All calculations happen in the database via SQL, which is efficient even for large datasets. The frontend only handles display formatting.
# In-App Notification Center

**Status:** Not Implemented  
**Priority:** Medium  
**Complexity:** Medium

## Overview

Currently, notifications are stored in the database and delivered via push notifications, but users have no way to view their notification history within the app. This feature would add a notification center where users can see all past notifications.

## Implementation Requirements

### 1. Create Notification List Screen (`/app/(tabs)/notifications.tsx` or similar)
- Query notifications table with pagination
- Show sender name, type icon, title, and timestamp
- Indicate read/unread status visually
- Group by date (Today, Yesterday, This Week, etc.)

### 2. Update Tab Navigation
- Add notifications tab with badge for unread count
- Or add to existing "More" section

### 3. Implement Notification Actions
- Tap to open relevant modal (using existing routing)
- Swipe to delete or mark as read/unread
- Pull to refresh

### 4. Add Notification Badge Logic
- Real-time unread count using Supabase subscription
- Update badge when notifications are read

### 5. Consider Additional Features
- Filter by notification type
- Search notifications
- Clear all/Mark all as read options

## Technical Notes

- All infrastructure is in place (database table, RLS policies, modal screens) - only the list UI is missing
- The existing `mark-notification-read` function uses the old `read` boolean field instead of `read_at` timestamp. This should be updated or the function removed since NotificationProvider handles it inline
- Can reuse existing NotificationProvider routing logic for opening modals

## Database Considerations

The notifications table already has:
- All necessary fields (id, recipient_id, sender_id, type, content, read_at, created_at)
- RLS policies for users to view their own notifications
- Foreign key relationships

## UI/UX Considerations

- Should match existing app design patterns
- Consider showing notification type with appropriate icons
- Unread notifications should be visually distinct
- Empty state when no notifications exist
- Loading state while fetching notifications
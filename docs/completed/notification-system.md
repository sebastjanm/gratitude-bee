# Notification System - Current Implementation

This document describes the actual notification system as implemented in the codebase.

## Overview

The notification system has been successfully refactored into a centralized, extensible routing system that handles all types of push notifications through a single provider.

## Core Components

### 1. NotificationProvider (`/providers/NotificationProvider.tsx`)

The central hub for all notification handling:

**Key Features:**
- Generic payload-based routing system
- Category-to-route mapping for extensibility
- Standardized payload passing to modal screens
- Session-aware notification handling
- Support for notification actions (e.g., "Thank You" button)

**Category Route Mapping:**
```typescript
const categoryRouteMapping: Record<string, string> = {
  appreciation: '/(modals)/appreciation',
  favor_request: '/(modals)/favor',
  ping_sent: '/(modals)/ping',
  hornet: '/(modals)/hornet',
  wisdom: '/(modals)/wisdom',
  dont_panic: '/(modals)/dont-panic',
};
```

**Notification Handling Flow:**
1. Receives notification response via Expo Notifications API
2. Marks notification as read in database
3. Handles special actions (e.g., 'thank-you-action')
4. Routes to appropriate modal based on categoryIdentifier
5. Passes entire payload as stringified JSON to modal

### 2. Send Notification Function (`/supabase/functions/send-notification/index.ts`)

Server-side function that:
- Receives event records from database triggers
- Fetches sender and receiver information
- Creates notification record in database
- Determines title, body, and categoryIdentifier based on event_type
- Sends push notification via Expo Push Service

**Supported Event Types and Categories:**
- APPRECIATION → 'appreciation'
- FAVOR_REQUEST → 'favor_request'
- FAVOR_ACCEPTED/DECLINED/COMPLETED → 'favor_response'
- PING → 'ping'
- DONT_PANIC → 'dont_panic'
- WISDOM → 'wisdom'
- HORNET → 'hornet'
- PING_RESPONSE → 'default'
- REACTION → 'default'

### 3. Modal Screens

All modal screens follow the standardized pattern:

**Pattern Implementation:**
```typescript
const { payload } = useLocalSearchParams<{ payload: string }>();
const { event, senderName } = JSON.parse(payload);
```

**Implemented Modals:**
- `/app/(modals)/appreciation.tsx` - Displays appreciation messages with thank you action
- `/app/(modals)/favor.tsx` - Shows favor requests with accept/decline options
- `/app/(modals)/ping.tsx` - Displays ping notifications
- `/app/(modals)/hornet.tsx` - Shows hornet strikes
- `/app/(modals)/wisdom.tsx` - Displays wisdom messages with thank you option
- `/app/(modals)/dont-panic.tsx` - Shows don't panic messages

### 4. Database Integration

**Notifications Table:**
- Stores all notifications with recipient_id, sender_id, type, and content
- Tracks read_at timestamp
- Referenced by notification_id in push payloads

**Event-Driven Architecture:**
- Database triggers automatically invoke send-notification function
- No manual notification sending required from client (except for special cases)

## Key Design Decisions

1. **Generic Payload System**: All notification data is passed as a generic JSON payload, making the system easily extensible

2. **Centralized Routing**: Single mapping object controls all notification routing, simplifying maintenance

3. **Standardized Modal Pattern**: All modal screens follow the same pattern for parsing and using notification data

4. **Database-First Approach**: Notifications are stored in database before sending, ensuring persistence and tracking

5. **Category-Based Routing**: Using categoryIdentifier allows for flexible notification types without code changes

## Current Capabilities

- ✅ Generic notification routing system
- ✅ Support for all current event types
- ✅ Interactive notification actions (e.g., Thank You button)
- ✅ Database persistence of all notifications
- ✅ Read status tracking
- ✅ Session-aware notification handling
- ✅ Launch notification support (when app opens from notification)
- ✅ Deduplication of processed notifications

## Integration Points

1. **Client Event Creation**: Most events trigger notifications automatically via database triggers
2. **Manual Invocation**: Some features (like favor requests in early implementation) manually invoke send-notification
3. **Push Token Management**: Handled separately in user registration/profile updates
4. **Notification Permissions**: Requested during onboarding flow
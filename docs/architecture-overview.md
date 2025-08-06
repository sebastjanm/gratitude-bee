# Gratitude Bee Architecture Overview

This document provides a high-level overview of the Gratitude Bee application architecture for new developers.

## Tech Stack

### Frontend
- **Framework**: React Native with Expo SDK 52
- **Language**: TypeScript
- **Navigation**: Expo Router v5 (file-based routing)
- **State Management**: 
  - React Query for server state
  - React Context for auth and notifications
  - Local component state for UI
- **UI Libraries**:
  - react-native-gifted-chat for messaging
  - lucide-react-native for icons
  - react-native-safe-area-context for device compatibility

### Backend
- **Platform**: Supabase
  - PostgreSQL database
  - Edge Functions (Deno runtime)
  - Realtime subscriptions
  - Row Level Security (RLS)
  - Storage for avatars
- **Authentication**: Supabase Auth
- **Push Notifications**: Expo Push Service

## Core Architecture Patterns

### 1. Event-Driven System
All user interactions create events in a central `events` table:
- Appreciations, favors, pings, wisdom messages, etc.
- Points are calculated server-side via database triggers
- Notifications sent automatically via database triggers

### 2. Partner-Based Design
- Users connect with one partner using invite codes
- All features revolve around partner interactions
- Single conversation per user pair

### 3. Real-time Features
Three Supabase Realtime features in use:
- **Postgres Changes**: Message sync and user updates
- **Broadcast**: Typing indicators
- **Presence**: Online/offline status

### 4. Server-Side Logic
Complex operations handled by:
- Database functions (e.g., analytics calculations)
- Edge Functions (e.g., partner connection, notifications)
- Database triggers (e.g., point calculations)

## Key Directories

```
/app/                   # Expo Router screens
  /(tabs)/             # Main tab navigation
  /(modals)/           # Modal screens for notifications
  /(auth)/             # Authentication flow
  /(info)/             # Static info screens
/components/           # Reusable React components
/providers/            # React Context providers
/utils/                # Utility functions and constants
/supabase/            
  /functions/          # Edge Functions
  /migrations/         # Database migrations
```

## Important Design Decisions

### 1. No Camera Dependencies
QR codes are scanned using native device camera app, not in-app camera. This reduces:
- App complexity
- Permission requirements
- Bundle size
- App store review friction

### 2. Push Notification Architecture
- Database triggers automatically send notifications
- NotificationProvider handles all routing
- Modal screens follow standardized payload pattern
- Interactive actions (e.g., "Thank You" button)

### 3. Points Economy
- Point values stored in database templates
- All calculations server-side for security
- Wallet tracks different point types (bees, honey, etc.)

### 4. Authentication Flow
- Supabase handles all auth
- Session managed by SessionProvider
- RLS policies enforce data access

## Development Workflow

### Local Development
```bash
npm start                    # Start Expo dev server
npm run ios                  # Run on iOS simulator
npm run android              # Run on Android emulator
```

### Database Changes
1. Create migration in `/supabase/migrations/`
2. Run `supabase db push` to apply
3. Update types if needed

### Adding Features
1. Database-first approach (schema, RLS, triggers)
2. Create Edge Functions if needed
3. Implement UI components
4. Add to appropriate navigation

## Common Patterns

### Fetching Data
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);
```

### Real-time Subscriptions
```typescript
const channel = supabase
  .channel('channel-name')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'messages' 
  }, handleNewMessage)
  .subscribe();
```

### Error Handling
- Use try-catch blocks
- Show user-friendly alerts
- Log errors for debugging

## Getting Started

1. Clone repository
2. Install dependencies: `npm install`
3. Set up Supabase project
4. Copy `.env.example` to `.env.local`
5. Run `npm start`

For detailed setup instructions, see the main README.md.
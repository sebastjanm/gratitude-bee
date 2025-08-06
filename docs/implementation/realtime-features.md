# Supabase Realtime Features Implementation

## Overview

Gratitude Bee uses all three Supabase Realtime features in the chat functionality:

1. **Postgres Changes** - Listen to database changes (INSERT, UPDATE)
2. **Broadcast** - Send low-latency typing indicators
3. **Presence** - Track online/offline status

## Current Implementation in chat.tsx

### ✅ Postgres Changes
Used for real-time updates of messages and user status:

1. **New Messages** - Listens for INSERT events on messages table
```typescript
const messageChannel = supabase
  .channel(`messages:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
  }, (payload) => {
    // Adds new messages to the UI (except own messages to avoid duplicates)
  })
  .subscribe();
```

2. **User Last Seen Updates** - Listens for UPDATE events on users table
```typescript
const userChannel = supabase
  .channel(`user:${participant.id}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'users',
    filter: `id=eq.${participant.id}`,
  }, (payload) => {
    // Updates partner's last_seen timestamp in the header
  })
  .subscribe();
```

### ✅ Broadcast
Used for typing indicators with low latency:

```typescript
const typingChannel = supabase
  .channel(`typing:${conversationId}`)
  .on('broadcast', { event: 'typing' }, ({ payload }) => {
    if (payload.user_id !== myUserId) {
      setIsPartnerTyping(payload.is_typing);
      // Auto-hide after 3 seconds with timeout
    }
  })
  .subscribe();
```

**Sending typing status:**
- Debounced to avoid excessive messages
- Sends true when user starts typing
- Sends false after 2 seconds of inactivity or when text is cleared

### ✅ Presence
Used for real-time online/offline status:

```typescript
const presenceChannel = supabase
  .channel(`presence:${conversationId}`)
  .on('presence', { event: 'sync' }, () => {
    // Check if partner is in presence state
    const state = presenceChannel.presenceState();
    const partnerPresence = Object.values(state).find(
      (presence: any) => presence[0]?.user_id === participant.id
    );
    setIsPartnerOnline(!!partnerPresence);
  })
  .on('presence', { event: 'join' }, ({ newPresences }) => {
    // Partner came online
  })
  .on('presence', { event: 'leave' }, ({ leftPresences }) => {
    // Partner went offline
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      // Track own presence
      await presenceChannel.track({
        user_id: myUserId,
        online_at: new Date().toISOString(),
      });
    }
  });
```

## Implementation Details

### Connection Status Handling
- Shows "Connecting..." banner when disconnected
- Animated pulsing dot for visual feedback
- Auto-reconnect after 5 seconds

### Channel Management
- All channels are properly cleaned up on unmount
- Typing status is set to false when leaving chat
- Each channel uses unique names with conversation ID

### UI Integration
1. **Online Status**: Green dot on avatar + "Online" text
2. **Typing Indicator**: Built-in GiftedChat typing bubble
3. **Connection Status**: Yellow banner at top when disconnected
4. **Last Seen**: Shows time since last activity when offline

### Performance Optimizations
1. **Typing Debouncing**: 2-second timeout prevents spam
2. **Last Seen Updates**: Only updates every 30 seconds while chat is open
3. **Optimistic Updates**: Messages appear instantly before server confirmation
4. **Channel Reuse**: Typing status uses same channel for sending/receiving

## Current Limitations

1. **Read Receipts**: Not implemented (no "seen" status for messages)
2. **Multiple Device Support**: Presence only tracks one device per user
3. **Offline Message Queue**: Messages fail if sent while disconnected
4. **Image Sharing**: URI field exists but not used in current UI

## Security Considerations

1. **Channel Names**: Use conversation IDs to prevent unauthorized access
2. **User Verification**: Always check user_id in payloads
3. **RLS Policies**: All database changes respect Row Level Security
4. **Presence Data**: Only tracks user_id and timestamp, no sensitive data
# Supabase Realtime Features Guide for GratitudeBee

## Overview

Supabase Realtime provides three main features that we can leverage in GratitudeBee:

1. **Postgres Changes** - Listen to database changes (INSERT, UPDATE, DELETE)
2. **Broadcast** - Send low-latency messages between clients
3. **Presence** - Track and synchronize user state (online/offline, typing)

## Current Implementation

### ✅ Postgres Changes (Currently Used)
We use Postgres Changes for real-time message updates:

```typescript
const channel = supabase
  .channel(`messages:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
  }, (payload) => {
    // Handle new message
  })
  .subscribe();
```

**Pros:**
- Automatic sync with database
- Works with RLS policies
- Persistent message storage

**Cons:**
- Higher latency than Broadcast
- Not suitable for ephemeral data

## Recommended Enhancements

### 1. Add Presence for Online Status

```typescript
// In messages.tsx
const presenceChannel = supabase.channel(`presence:${conversationId}`);

// Track current user's presence
presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    // Update UI with online users
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    // User came online
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    // User went offline
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user_id: myUserId,
        online_at: new Date().toISOString(),
      });
    }
  });
```

### 2. Add Broadcast for Typing Indicators

```typescript
// Create a broadcast channel
const typingChannel = supabase.channel(`typing:${conversationId}`);

// Send typing status
const sendTypingStatus = (isTyping: boolean) => {
  typingChannel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { 
      user_id: myUserId,
      typing: isTyping,
      timestamp: new Date().toISOString()
    }
  });
};

// Listen for typing events
typingChannel
  .on('broadcast', { event: 'typing' }, ({ payload }) => {
    if (payload.user_id !== myUserId) {
      setPartnerTyping(payload.typing);
      
      // Auto-hide typing indicator after 3 seconds
      if (payload.typing) {
        setTimeout(() => setPartnerTyping(false), 3000);
      }
    }
  })
  .subscribe();
```

### 3. Combine All Features

```typescript
// Complete real-time setup for messages screen
useEffect(() => {
  if (!conversationId || !myUserId) return;

  // 1. Postgres Changes for messages
  const messageChannel = supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, handleNewMessage)
    .subscribe();

  // 2. Presence for online status
  const presenceChannel = supabase
    .channel(`presence:${conversationId}`)
    .on('presence', { event: 'sync' }, handlePresenceSync)
    .on('presence', { event: 'join' }, handleUserJoin)
    .on('presence', { event: 'leave' }, handleUserLeave)
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({ user_id: myUserId });
      }
    });

  // 3. Broadcast for typing
  const typingChannel = supabase
    .channel(`typing:${conversationId}`)
    .on('broadcast', { event: 'typing' }, handleTypingEvent)
    .subscribe();

  return () => {
    supabase.removeChannel(messageChannel);
    supabase.removeChannel(presenceChannel);
    supabase.removeChannel(typingChannel);
  };
}, [conversationId, myUserId]);
```

## Implementation Priority

1. **Phase 1** (Current): Postgres Changes for messages ✅
2. **Phase 2**: Add Presence for online/offline status
3. **Phase 3**: Add Broadcast for typing indicators
4. **Phase 4**: Add read receipts using UPDATE events

## Best Practices

1. **Use unique channel names** to avoid conflicts
2. **Always clean up channels** in useEffect cleanup
3. **Handle connection states** (SUBSCRIBED, TIMED_OUT, etc.)
4. **Implement reconnection logic** for better reliability
5. **Use appropriate feature for each use case**:
   - Postgres Changes: Persistent data (messages, reactions)
   - Broadcast: Ephemeral data (typing, cursor position)
   - Presence: User state (online/offline, active status)

## Performance Considerations

1. **Limit subscriptions**: Don't create too many channels
2. **Use filters**: Filter Postgres Changes to reduce payload
3. **Debounce typing**: Don't send typing status on every keystroke
4. **Clean up**: Always remove channels when unmounting

## Security

1. **RLS Policies**: Postgres Changes respect RLS
2. **Channel Names**: Use UUIDs in channel names for security
3. **Payload Validation**: Always validate incoming payloads
4. **User Authentication**: Verify user identity in payloads
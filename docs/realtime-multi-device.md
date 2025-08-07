# Supabase Realtime Multi-Device Handling

## Problem
When the same user is logged in on multiple devices simultaneously, it can cause:
- Presence conflicts (online/offline status confusion)
- Duplicate message handling
- WebSocket connection competition
- Typing indicator conflicts
- Channel subscription issues

## Solutions Implemented

### 1. Device ID Tracking
- Each device gets a unique ID stored in AsyncStorage
- Device ID is included in presence tracking
- Allows distinguishing between multiple devices for the same user

### 2. Improved Presence Handling
- Counts all devices for a user when determining online status
- Partner is shown as online if ANY of their devices are online
- Logs when multiple devices are detected (for debugging)

### 3. Connection Management
- RealtimeManager class handles reconnection logic
- Exponential backoff for reconnection attempts
- Proper cleanup of channels on disconnect

## Testing Multi-Device Scenarios

### How to Test:
1. Log in with the same account on two devices (e.g., physical phone + simulator)
2. Open the chat on both devices
3. Use the Realtime Diagnostic tool (More → Tools → Realtime Diagnostic) to monitor connections

### What to Look For:
- Both devices should maintain their own WebSocket connections
- Messages sent from one device should appear on the other
- Online status should work correctly
- No duplicate messages should appear

### Expected Behavior:
- ✅ Each device maintains its own connection
- ✅ Messages sync across all devices
- ✅ Presence shows user online if ANY device is connected
- ✅ Typing indicators work per device

## Debugging Tips

### Check Active Channels:
```javascript
// In Realtime Diagnostic or console:
const channels = supabase.getChannels();
console.log('Active channels:', channels.length);
channels.forEach(ch => console.log(ch.topic, ch.state));
```

### Monitor Device IDs:
```javascript
// Check device ID in AsyncStorage:
import { getDeviceId } from '@/utils/device-id';
const deviceId = await getDeviceId();
console.log('Current device ID:', deviceId);
```

### Common Issues:

1. **"Channel already subscribed" errors**
   - Solution: Use RealtimeManager to handle channel lifecycle
   
2. **Presence not updating correctly**
   - Solution: Include device_id in presence payload
   
3. **Messages appearing twice**
   - Solution: Check sender_id before adding to message list
   
4. **Connection drops on one device when other connects**
   - Solution: Ensure unique channel names per conversation, not per user

## Best Practices

1. **Always include device identification** in presence tracking
2. **Use conversation-based channels**, not user-based channels
3. **Implement proper cleanup** when components unmount
4. **Handle reconnection** gracefully with exponential backoff
5. **Test on multiple real devices** as simulators may behave differently

## Configuration

Ensure Supabase client is configured properly:
```typescript
const supabase = createClient(url, key, {
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting
    },
  },
  auth: {
    persistSession: true, // Maintain session across app restarts
  },
});
```

## Platform-Specific Notes

### iOS
- Background/foreground transitions may disconnect WebSocket
- Consider implementing background fetch for offline messages

### Android (especially EMUI/Huawei)
- Aggressive battery optimization may kill connections
- Users should add app to "Protected Apps" list
- May need to implement foreground service for persistent connection

### Development vs Production
- Development builds may have more connection issues
- Hot reload can cause channel conflicts
- Production builds generally more stable
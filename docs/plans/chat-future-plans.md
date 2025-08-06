# Chat System - Future Plans & Technical Debt

This document outlines future enhancements and improvements for the chat system.

## Technical Debt

### Current Limitations
1. **No Image Support** - URI field exists in database but UI not implemented
2. **No Read Receipts** - Messages don't show "seen" status
3. **No Offline Queue** - Messages fail if sent while disconnected
4. **Single Device** - Presence tracks only one device per user
5. **No Message Deletion** - Once sent, messages are permanent
6. **Fixed to One Partner** - No group chats or multiple conversations

### Infrastructure Gaps
- **chat-images** storage bucket configured but unused
- **uri** field in messages table not utilized
- expo-image-picker dependency installed but not integrated

## Future Enhancement Plans

### Phase 1: Image Messaging
**Goal:** Implement complete image sharing functionality

1. **Database Updates**
   - Add `content_type` enum column (text, image, gif)
   - Add `media_url` column for CDN URLs

2. **UI Implementation**
   - Add image picker button to input toolbar
   - Integrate expo-image-picker for photo selection
   - Use expo-image-manipulator for compression (max 1280px)

3. **Storage Integration**
   - Upload compressed images to chat-images bucket
   - Generate secure URLs with RLS
   - Handle upload progress indicators

4. **Display Features**
   - Inline image thumbnails in chat
   - Tap to view full screen with react-native-image-viewing
   - Pinch to zoom support

### Phase 2: Enhanced Messaging Features

1. **Read Receipts**
   - Add `read_at` timestamp to messages
   - Show double checkmarks for read messages
   - Batch mark as read on scroll

2. **Message Reactions**
   - Quick emoji reactions on long press
   - Store in separate reactions table
   - Real-time reaction updates

3. **Voice Messages**
   - Record with expo-av
   - Waveform visualization
   - Playback speed control

4. **Message Search**
   - Full-text search with pg_trgm
   - Filter by date, media type
   - Jump to message in context

### Phase 3: Advanced Features

1. **Message Actions**
   - Edit messages (with edit history)
   - Delete messages (soft delete)
   - Reply to specific messages
   - Forward messages

2. **Rich Content**
   - Link previews with Open Graph
   - YouTube video embeds
   - Location sharing
   - Contact cards

3. **Security Enhancements**
   - End-to-end encryption option
   - Disappearing messages
   - Screenshot detection (iOS)
   - Message pinning

### Phase 4: Multi-Image & GIF Support

1. **Multiple Image Selection**
   - Batch upload with progress
   - Image carousel view
   - Drag to reorder before sending

2. **GIF Integration**
   - GIPHY SDK integration
   - Trending GIFs section
   - Search functionality
   - Favorite GIFs

## Performance Improvements

1. **Message Virtualization**
   - Implement FlashList for better performance
   - Lazy load images
   - Preload adjacent messages

2. **Offline Support**
   - Queue messages in AsyncStorage
   - Sync on reconnection
   - Conflict resolution

3. **Push Notifications**
   - Rich notifications with images
   - Quick reply from notification
   - Notification grouping

## Architecture Improvements

1. **Message Queue System**
   - Implement proper offline queue
   - Retry failed messages
   - Delivery confirmations

2. **Caching Strategy**
   - Cache images locally
   - Implement cache expiry
   - Storage management

3. **State Management**
   - Consider Zustand for complex state
   - Optimize re-renders
   - Memoize expensive computations

## Analytics & Monitoring

1. **Usage Metrics**
   - Message send rate
   - Media usage statistics
   - Connection reliability

2. **Error Tracking**
   - Sentry integration
   - Custom error boundaries
   - Performance monitoring

## Accessibility Improvements

1. **Screen Reader Support**
   - Proper ARIA labels
   - Navigation announcements
   - Message status announcements

2. **Visual Enhancements**
   - High contrast mode
   - Larger text options
   - Reduce motion support
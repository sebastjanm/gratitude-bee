# Nudge System Documentation

## Overview
The Gratitude Bee nudge system helps couples build consistent appreciation habits through timely reminders. It's a simple, psychology-based feature that sends push notifications to encourage users to express gratitude regularly.

## Why Nudges?

### The Problem
- 92% of couples believe appreciation is important
- Only 48% express it regularly
- Main reason: Simply forgetting in daily life

### Our Solution
Smart reminders that:
- Come at the right time
- Are easy to act on
- Build positive habits
- Strengthen relationships

## How It Works

### The Hook Model
We use a simple habit loop:
```
Trigger (Nudge) → Action (Send appreciation) → Reward (Partner's joy) → Stronger Bond
```

### 7 Types of Nudges

#### 1. Daily Reminder
- **When**: Every day at user's chosen times (multiple selections allowed)
- **Message**: "Time for your daily appreciation! What made you smile today? 💝"
- **Features**:
  - Select multiple reminder times throughout the day
  - 4 preset options: Morning (8 AM), Lunch (12 PM), Evening (8 PM), Night (10 PM)
  - Visual feedback with checkmarks for selected times
  - Shows all selected times in summary

#### 2. Appreciation Reminder
- **When**: After 3 days of no activity
- **Message**: "Hey! Your partner might love hearing from you today 💝"

#### 3. Milestone Celebrations  
- **When**: On streaks (7, 14, 30 days)
- **Message**: "You're on a 7-day streak! Keep the love flowing 🎉"

#### 4. Conversation Starters
- **When**: Weekly on quiet days
- **Message**: "Why not thank them for their patience today?"

#### 5. Peak Time Nudges
- **When**: User's most active hour (based on history)
- **Message**: "It's 8 PM - your usual appreciation time!"

#### 6. Reciprocity Booster
- **When**: After partner sends appreciation
- **Message**: "Your partner sent you love! Send some back? 💕"

#### 7. Surprise Moments
- **When**: Random 1-2x per week
- **Message**: "Surprise them with unexpected appreciation!"

## Technical Implementation

### Database Schema
```sql
-- Store user nudge preferences
ALTER TABLE users ADD COLUMN nudges_enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN nudge_settings JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN daily_reminder_times JSONB DEFAULT '["20:00"]';
ALTER TABLE users ADD COLUMN last_appreciation_sent TIMESTAMP;

-- Track nudge performance
CREATE TABLE nudge_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  nudge_type TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  opened_at TIMESTAMP,
  action_taken_at TIMESTAMP
);
```

### Supabase Edge Function
```typescript
// Run this function every hour via cron
import { createClient } from '@supabase/supabase-js';

// This runs automatically every hour - users don't need to do anything!
export async function sendNudges() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format

  // Automatically find and notify users based on their settings
  // No manual intervention needed - it just works!
  
  // 1. Daily Reminder Nudges (supports multiple times per user)
  const { data: dailyReminderUsers } = await supabase
    .from('users')
    .select('id, display_name, expo_push_token, daily_reminder_times, nudge_settings')
    .not('expo_push_token', 'is', null)  // Only users with push tokens
    .eq('nudges_enabled', true)           // Master toggle is on
    .eq('nudge_settings->daily_reminder', true)  // Feature is enabled
    .contains('daily_reminder_times', [currentTime]);  // Current time matches

  for (const user of dailyReminderUsers || []) {
    // Automatically send - no user action required
    await sendPushNotification({
      to: user.expo_push_token,
      title: 'Daily Appreciation Time! 💝',
      body: 'What made you smile today? Share it with your partner!',
      data: { type: 'nudge', nudge_type: 'daily_reminder' }
    });
    
    // Track delivery
    await supabase.from('nudge_history').insert({
      user_id: user.id,
      nudge_type: 'daily_reminder',
      sent_at: new Date()
    });
  }

  // 2. Appreciation Reminder (3-day inactive)
  const { data: inactiveUsers } = await supabase
    .from('users')
    .select('id, display_name, expo_push_token')
    .eq('nudges_enabled', true)
    .eq('nudge_settings->appreciation_reminder', true)
    .lt('last_appreciation_sent', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));

  for (const user of inactiveUsers || []) {
    if (user.expo_push_token) {
      await sendPushNotification({
        to: user.expo_push_token,
        title: 'Missing your partner? 💝',
        body: `Hey ${user.display_name}! Your partner might love hearing from you today`,
        data: { type: 'nudge', nudge_type: 'appreciation_reminder' }
      });
    }
  }
}
```

### Client-Side Settings
```typescript
// In the app, users can configure their nudges
const nudgeSettings = {
  daily_reminder: true,
  appreciation_reminder: true,
  milestone_celebration: true,
  conversation_starter: false,
  peak_time: false,
  reciprocity_boost: true,
  surprise_moments: false
};

// Users can select multiple daily reminder times
const dailyReminderTimes = ['08:00', '20:00']; // 8 AM and 8 PM

// Save to AsyncStorage and sync with Supabase
await AsyncStorage.setItem('nudge_settings', JSON.stringify(nudgeSettings));
await supabase
  .from('users')
  .update({ nudge_settings: nudgeSettings })
  .eq('id', userId);
```

## Push Notification Setup (Automatic & Seamless)

### Modern UX Approach
Users don't see "Push Notifications" - they just enable features and they work automatically.

### Automatic Permission & Token Management
```typescript
import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';

// Helper function used by Daily Reminders and Nudge Settings screens
async function enableNotificationFeature(
  featureType: 'reminders' | 'nudges',
  onSuccess: () => void,
  onFailure: () => void
) {
  try {
    // 1. Check current permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    let finalStatus = existingStatus;
    
    // 2. Request permission only if needed
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // 3. Handle permission denied
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Notifications Required',
        `To receive ${featureType === 'reminders' ? 'daily reminders' : 'smart nudges'}, please enable notifications in your device settings.`,
        [
          { text: 'Cancel', onPress: onFailure },
          { text: 'Open Settings', onPress: () => {
            Linking.openSettings();
            onFailure(); // Still call failure to revert toggle
          }}
        ]
      );
      return;
    }
    
    // 4. Get and save push token
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    await supabase
      .from('users')
      .update({ expo_push_token: token })
      .eq('id', userId);
    
    // 5. Success - feature can be enabled
    onSuccess();
    
  } catch (error) {
    console.error('Error setting up notifications:', error);
    Alert.alert('Error', 'Failed to enable notifications. Please try again.');
    onFailure();
  }
}

// Usage in Daily Reminders screen
const handleToggleReminders = async (value: boolean) => {
  if (value) {
    await enableNotificationFeature(
      'reminders',
      () => {
        // Success: save settings and update UI
        setRemindersEnabled(true);
        AsyncStorage.setItem('daily_reminder_enabled', 'true');
      },
      () => {
        // Failure: keep toggle off
        setRemindersEnabled(false);
      }
    );
  } else {
    // Disabling doesn't need permission check
    setRemindersEnabled(false);
    AsyncStorage.setItem('daily_reminder_enabled', 'false');
  }
};

// Handle notification clicks
Notifications.addNotificationResponseReceivedListener(response => {
  const { type, data } = response.notification.request.content.data;
  
  switch(type) {
    case 'daily_reminder':
      router.push('/appreciation');
      break;
      
    case 'partner_appreciation':
      router.push(`/activity?messageId=${data.messageId}`);
      break;
      
    case 'streak_warning':
      router.push('/(tabs)');
      break;
      
    case 'milestone':
      router.push(`/rewards?highlight=${data.milestone}`);
      break;
  }
});
```

## User Experience

### Key UX Principles (Modern App Approach)

1. **No Technical Jargon**
   - ❌ "Enable Push Notifications"
   - ✅ "Get Daily Reminders"
   - ✅ "Receive Smart Nudges"

2. **Automatic Everything**
   - User toggles feature ON → System handles permission → Notifications start
   - User toggles feature OFF → Notifications stop immediately
   - No separate "notification settings" to confuse users

3. **Just-In-Time Permissions**
   - Only ask for notification permission when user enables a feature that needs it
   - Explain value in context: "To remind you daily, we need notification permission"
   - Graceful fallback if denied with option to open settings

4. **Transparent Behavior**
   - What you see is what you get
   - If Daily Reminders shows "8 AM, 8 PM" → You get notifications at exactly those times
   - No hidden settings or complex configurations

### Nudge Settings Screen
Located at: `/app/more/nudges.tsx`
- Master toggle to enable/disable all nudges
- Individual toggles for each nudge type
- Hook strategy explanation
- Example messages for each type
- Benefits section

### Daily Reminders Screen
Located at: `/app/more/reminders.tsx`
- **Multiple Time Selection**: Users can select one or more reminder times
- **Preset Options**: 
  - Morning (8:00 AM) - "Start the day with gratitude"
  - Lunch (12:00 PM) - "Midday appreciation break"
  - Evening (8:00 PM) - "Reflect on the day together"
  - Night (10:00 PM) - "End the day with love"
- **Visual Feedback**: Selected times show with checkmarks and highlighting
- **Sample Notification**: Preview of what users will receive
- **Selected Times Summary**: Shows all selected times at a glance

### Smart Frequency
- Maximum 2 nudges per day
- At least 4 hours between nudges
- No nudges late at night (10 PM - 8 AM)
- Stop nudging if user just sent appreciation

## Measuring Success

### Key Metrics
```sql
-- Simple analytics view
CREATE VIEW nudge_effectiveness AS
SELECT 
  nudge_type,
  COUNT(*) as total_sent,
  COUNT(opened_at) as total_opened,
  COUNT(action_taken_at) as total_actions,
  (COUNT(action_taken_at)::float / COUNT(*)) * 100 as conversion_rate
FROM nudge_history
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY nudge_type;
```

### Success Indicators
- 40% open rate
- 25% action rate (user sends appreciation after nudge)
- Increased appreciation frequency
- Longer streaks

## Privacy & Ethics

### Our Principles
- **No guilt**: Positive encouragement only
- **User control**: Easy to customize or disable
- **Transparency**: Clear about when and why we nudge
- **Privacy**: Never share personal patterns

### Respectful Nudging
- Never pressure or manipulate
- Support authentic expression
- Respect relationship dynamics
- Honor user preferences

## Implementation Checklist

### Phase 1 (Current)
- [x] Nudge Settings screen with on/off toggles
- [x] Daily Reminders screen with multiple time selection
- [x] Store preferences in AsyncStorage
  - `daily_reminder_enabled`: boolean
  - `daily_reminder_times`: JSON array of time strings (e.g., ["08:00", "20:00"])
  - `nudge_settings`: JSON object with individual nudge toggles
- [ ] Basic push notification setup
- [ ] Appreciation reminder nudge (3-day)
- [ ] Track nudge history

### Phase 2 (Next) - Automatic Push Notifications
- [ ] Add `enableNotificationFeature` helper to both screens
- [ ] Request permission only when features are enabled
- [ ] Save Expo push token to Supabase automatically
- [ ] Implement Supabase Edge Function with hourly cron job
- [ ] Test all 7 nudge types work automatically
- [ ] Add notification click handlers for each type
- [ ] Basic analytics dashboard
- [ ] Ensure notifications respect user settings in real-time



## Conclusion

The Gratitude Bee nudge system v1 is intentionally simple: gentle reminders that help users remember to appreciate their partners. By starting with basic functionality and proven behavioral principles, we can help couples build stronger relationships through consistent, authentic appreciation.
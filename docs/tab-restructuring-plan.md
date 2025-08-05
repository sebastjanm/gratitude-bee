# Tab Restructuring Implementation Plan

## Overview
Restructure the app from 6 tabs to 5 tabs with improved organization and user value.

**Current Structure:**
- Home (index.tsx)
- Messages (messages.tsx)
- Timeline (timeline.tsx)
- Badges (badges.tsx)
- Analytics (analytics.tsx)
- Profile (profile.tsx)

**Target Structure:**
- Home
- Chat (formerly Messages)
- Rewards (new - combines Badges + Points + Achievements)
- Activity (formerly Timeline + Insights)
- Profile (includes Analytics)

## Phase 1: Simple Renames

### 1.1 Rename Messages to Chat
```bash
mv app/(tabs)/messages.tsx app/(tabs)/chat.tsx
```

**Update references:**
- `app/(tabs)/_layout.tsx` - Update tab name and label
- Update all imports from `messages` to `chat`
- Update navigation references: `router.push('/messages')` → `router.push('/chat')`

### 1.2 Rename Timeline to Activity
```bash
mv app/(tabs)/timeline.tsx app/(tabs)/activity.tsx
```

**Update references:**
- `app/(tabs)/_layout.tsx` - Update tab name and label
- Update all imports from `timeline` to `activity`
- Update navigation references: `router.push('/timeline')` → `router.push('/activity')`

### 1.3 Update Tab Bar Icons
In `app/(tabs)/_layout.tsx`:
- Chat: Use `MessageCircle` or `MessageSquare` icon
- Activity: Use `Activity` or `TrendingUp` icon

## Phase 2: Create Rewards Tab

### 2.1 Create rewards.tsx
```typescript
// app/(tabs)/rewards.tsx
// Structure:
// - Points Balance Component
//   - Current favor points
//   - Total appreciation points
//   - Weekly earned/spent
// - Badges Gallery Component (move from badges.tsx)
// - Achievements Component
//   - Completed achievements
//   - Locked achievements
//   - Progress bars
```

### 2.2 Database Schema for Achievements
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMP,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  UNIQUE(user_id, achievement_type)
);
```

### 2.3 Achievement Types
```typescript
enum AchievementType {
  FIRST_WEEK = 'first_week',
  APPRECIATION_10 = 'appreciation_10',
  APPRECIATION_100 = 'appreciation_100',
  STREAK_7 = 'streak_7',
  STREAK_30 = 'streak_30',
  PERFECT_RESPONSE = 'perfect_response',
  FAVOR_MASTER = 'favor_master',
}
```

### 2.4 Update Navigation
In `app/(tabs)/_layout.tsx`:
- Add Rewards tab
- Use `Trophy` or `Award` icon
- Position between Chat and Activity

## Phase 3: Enhance Activity Tab

### 3.1 Add Summary Components
```typescript
// components/ActivitySummary.tsx
interface SummaryData {
  weeklyStats: {
    sent: number;
    received: number;
    streak: number;
  };
  insights: string[];
  milestones: Milestone[];
}
```

### 3.2 Add Relationship Insights
```typescript
// components/RelationshipInsights.tsx
// - Response rate calculation
// - Activity patterns (time of day analysis)
// - Balance meter (giving vs receiving ratio)
// - Love language detection
```

### 3.3 Smart Prompts Engine
```typescript
// utils/promptEngine.ts
interface Prompt {
  type: 'nudge' | 'milestone' | 'pattern';
  message: string;
  action?: () => void;
}

// Check for:
// - Inactivity periods
// - Imbalanced exchanges
// - Milestone opportunities
// - Partner's patterns
```

### 3.4 Enhanced Timeline Grouping
```typescript
// Group events by:
// - Today
// - Yesterday
// - This Week
// - Last Week
// - Older

// Add special markers for:
// - Milestones
// - Streaks
// - High activity days
```

## Phase 4: Move Analytics to Profile

### 4.1 Create ProfileAnalytics Component
```typescript
// components/ProfileAnalytics.tsx
// Move all content from analytics.tsx
// Make it a scrollable section within Profile
```

### 4.2 Update Profile Structure
```typescript
// app/(tabs)/profile.tsx
// Sections:
// 1. Profile Header
// 2. Quick Actions (QR Code, Settings)
// 3. Relationship Analytics (expandable)
// 4. Account Management
// 5. Support & Help
```

### 4.3 Remove Analytics Tab
- Remove from `app/(tabs)/_layout.tsx`
- Delete `app/(tabs)/analytics.tsx` after migration
- Update any deep links

## Phase 5: Navigation Updates

### 5.1 Tab Bar Configuration
```typescript
// app/(tabs)/_layout.tsx
const tabs = [
  { name: 'index', title: 'Home', icon: Home },
  { name: 'chat', title: 'Chat', icon: MessageCircle },
  { name: 'rewards', title: 'Rewards', icon: Trophy },
  { name: 'activity', title: 'Activity', icon: Activity },
  { name: 'profile', title: 'Profile', icon: User },
];
```

### 5.2 Remove Deprecated Tabs
- Remove badges.tsx after content moved to rewards.tsx
- Remove analytics.tsx after content moved to profile.tsx
- Clean up any unused imports

## Phase 6: Data Migration & Cleanup

### 6.1 Update Supabase Functions
- Modify notification routing for new tab names
- Update any edge functions that reference old paths

### 6.2 Update Deep Links
```typescript
// Update all instances of:
'/messages' → '/chat'
'/timeline' → '/activity'
'/badges' → '/rewards'
'/analytics' → '/profile?section=analytics'
```

### 6.3 Testing Checklist
- [ ] Navigation between all tabs works
- [ ] All existing features remain functional
- [ ] New features (achievements, insights) display correctly
- [ ] Push notifications route to correct screens
- [ ] Deep links work properly
- [ ] No broken imports or references
- [ ] Performance is maintained or improved

## Rollback Plan

### Keep Old Files
- Don't delete old files until all phases complete
- Keep badges.tsx and analytics.tsx as backup

### Feature Flags (Optional)
```typescript
const USE_NEW_TAB_STRUCTURE = true;

// In _layout.tsx
const tabConfig = USE_NEW_TAB_STRUCTURE ? newTabs : oldTabs;
```

### Database Rollback
- Achievements table is new, can be dropped
- No changes to existing tables
- All changes are additive

## Phase 7: Menu/Settings Restructure

### 7.1 Overview
Replace Profile tab with a "More" tab using a hamburger menu icon (☰).

### 7.2 Visual Mockup
```
┌─────────────────────────────────┐
│ More                        🔍   │ ← Search icon
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ 👤 John Doe                 │ │ ← Quick profile card
│ │ Connected to: Jane ❤️       │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 👤 Account & Profile         >  │
├─────────────────────────────────┤
│ 📊 Analytics & Progress      >  │
├─────────────────────────────────┤
│ 🔔 Notifications & Reminders >  │
├─────────────────────────────────┤
│ 🎯 Goals & Preferences       >  │
├─────────────────────────────────┤
│ 🛠️ Tools & Features          >  │
├─────────────────────────────────┤
│ ❓ Help & Support            >  │
├─────────────────────────────────┤
│ ℹ️ About & Legal             >  │
└─────────────────────────────────┘

Bottom Tab Bar:
[🏠 Home] [💬 Chat] [🏆 Rewards] [📊 Activity] [☰ More]
```

### 7.3 Detailed Structure
```
Menu/Settings Screen
├── Quick Profile Card
│   ├── Avatar + Display Name
│   └── Partner Connection Status
│
├── Main Sections (Vertical list)
│   ├── Account & Profile
│   │   ├── Edit Profile
│   │   ├── Avatar & Display Name
│   │   ├── Partner Connection
│   │   └── Security Settings
│   │
│   ├── Analytics & Progress
│   │   ├── Relationship Analytics (expandable)
│   │   ├── Activity Insights
│   │   ├── Achievement Progress
│   │   └── Export Reports
│   │
│   ├── Notifications & Reminders
│   │   ├── Push Notifications
│   │   ├── Daily Reminders
│   │   ├── Nudge Settings
│   │   └── Quiet Hours
│   │
│   ├── Goals & Preferences
│   │   ├── Weekly Goals
│   │   ├── Favorite Categories
│   │   ├── Display Preferences
│   │   └── Language Settings
│   │
│   ├── Tools & Features
│   │   ├── Invite Partner
│   │   ├── Export Memory Book
│   │   ├── Share Achievements
│   │   └── Backup Data
│   │
│   ├── Help & Support
│   │   ├── FAQ & Tutorials
│   │   ├── Video Guides
│   │   ├── Contact Support
│   │   └── Report Issue
│   │
│   └── About & Legal
│       ├── Terms of Service
│       ├── Privacy Policy
│       ├── Impressum
│       ├── Licenses
│       └── Version Info
```

### 7.4 Benefits
- Better organization of features
- Room for growth
- Clearer navigation
- Search functionality
- Consistent with modern app patterns
- Improved discoverability
- Scalable architecture

### 7.5 Implementation Steps

1. **Update Tab Navigation**
   ```typescript
   // app/(tabs)/_layout.tsx
   import { Menu } from 'lucide-react-native';
   
   <Tabs.Screen
     name="more"
     options={{
       title: 'More',
       tabBarIcon: ({ color, size, focused }) => (
         <AnimatedIcon icon={Menu} color={color} size={size} focused={focused} />
       ),
     }}
   />
   ```

2. **Create Menu Screen**
   ```typescript
   // app/(tabs)/menu.tsx
   const menuSections = [
     {
       id: 'account',
       title: 'Account & Profile',
       icon: User,
       color: Colors.primary,
       items: [
         { title: 'Edit Profile', route: '/menu/profile' },
         { title: 'Partner Connection', route: '/menu/partner' },
         { title: 'Security', route: '/menu/security' },
       ]
     },
     // ... other sections
   ];
   ```

3. **Design Principles**
   - Card-based layout with shadows
   - Each section has icon, title, and chevron
   - Tap to navigate to sub-screens
   - Consistent spacing and typography
   - Search bar with filter functionality

4. **Migration Path**
   - Rename profile.tsx to menu.tsx
   - Update all navigation references
   - Create sub-screens for each section
   - Move existing profile components to appropriate sub-screens
   - Add search functionality

### 7.6 Alternative Approaches Considered

1. **Three-Dot Menu (●●●) in Header**
   - Pros: More space in tab bar
   - Cons: Less discoverable

2. **Hamburger Menu (☰) Pattern**
   - Pros: Familiar pattern
   - Cons: Outdated, poor discoverability

3. **Keep Profile + Add Settings**
   - Pros: Separation of concerns
   - Cons: Two similar tabs

### 7.7 Technical Implementation Details
See comprehensive plan in `/docs/menu-restructure-plan.md`

## Technical Considerations

### Performance
- Lazy load heavy components (charts, analytics)
- Implement pagination for achievements
- Cache summary calculations
- Use React.memo for expensive renders

### State Management
- Consider moving achievement state to global context
- Cache activity insights for quick loading
- Implement optimistic updates for better UX

### Error Handling
- Graceful fallbacks for missing data
- Clear error messages
- Retry mechanisms for failed loads
- Offline support considerations
# Menu/Profile Restructuring Plan

## Overview
Transform the Profile tab into a Settings/Menu tab with better organization and navigation.

## Proposed Structure

### Phase 7: Replace Profile Tab with Menu/Settings

#### 7.1 Tab Bar Changes
- Replace Profile tab with Settings tab
- Use Settings icon (⚙️) instead of User icon
- Label as "Menu" or "Settings"

#### 7.2 New Menu Structure

```
Settings/Menu Screen
├── Quick Access Bar (Horizontal scroll)
│   ├── My Profile (avatar + name)
│   ├── Partner Status
│   └── Quick Stats
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

#### 7.3 Design Principles

1. **Card-Based Layout**
   - Each section is a card with icon and arrow
   - Tap to navigate to sub-screen
   - Clean, minimal design

2. **Search Functionality**
   - Add search bar at top
   - Quick access to any setting

3. **Visual Hierarchy**
   - Most used items at top
   - Legal/About at bottom
   - Clear section separators

4. **Navigation Pattern**
   - Main menu → Category → Specific setting
   - Breadcrumb navigation
   - Back button always visible

#### 7.4 Implementation Steps

1. **Create new menu structure**
   ```typescript
   // app/(tabs)/menu.tsx
   const menuSections = [
     {
       id: 'account',
       title: 'Account & Profile',
       icon: User,
       items: [...]
     },
     // ... other sections
   ];
   ```

2. **Update tab bar**
   ```typescript
   // _layout.tsx
   <Tabs.Screen
     name="menu"
     options={{
       title: 'Menu',
       tabBarIcon: ({ color, size, focused }) => (
         <AnimatedIcon icon={Settings} color={color} size={size} focused={focused} />
       ),
     }}
   />
   ```

3. **Create sub-screens**
   - Each major section gets its own screen
   - Consistent header with back navigation
   - Maintain design system throughout

#### 7.5 Benefits

1. **Better Organization**
   - Logical grouping of features
   - Easier to find settings
   - Room for future features

2. **Improved UX**
   - Less scrolling
   - Clear categories
   - Search functionality

3. **Scalability**
   - Easy to add new sections
   - Sub-menus for complex features
   - Better for feature discovery

#### 7.6 Migration Path

1. Keep existing profile.tsx temporarily
2. Create new menu.tsx with new structure
3. Gradually move features to sub-screens
4. Update navigation references
5. Remove old profile.tsx

## Alternative Approaches

### A. Top-Right Menu Button
- Add menu button to header
- Opens overlay menu
- Quick access to common actions

### B. Bottom Sheet Menu
- Swipe up from bottom
- Quick actions + full menu
- Modern gesture-based UI

### C. Tab + Header Combo
- Keep Profile tab for user info
- Add Settings button in header
- Separate concerns

## Recommendation

Implement Phase 7 with the Settings tab approach. This provides:
- Familiar navigation pattern
- Room for all features
- Clear organization
- Future scalability
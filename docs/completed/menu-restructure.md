# Menu/More Tab Implementation

This document describes the implemented More tab structure in Gratitude Bee.

## Overview

The app uses a "More" tab (previously Profile) that serves as a central menu for settings, tools, and information. This tab uses a hamburger menu icon and organizes features into logical sections.

## Implementation

### Tab Structure

The More tab is implemented in `/app/(tabs)/more.tsx` and appears as the 5th tab in the navigation bar with:
- **Icon**: Hamburger menu (three lines)
- **Label**: "More"
- **Position**: Rightmost tab

### Header

The More screen includes:
- Settings icon and "More" title
- Help icon button (navigates to help center)
- Subtitle: "Settings, tools, and information"

### Profile Card

At the top, displays:
- User avatar (or placeholder)
- Display name
- "View and edit profile" text
- Tap navigates to profile screen

### Menu Sections

The menu is organized into 5 sections:

#### 1. Analytics (Blue)
- **Icon**: BarChart3
- **Items**:
  - Relationship Analytics - View stats and insights

#### 2. Settings (Orange)
- **Icon**: Settings
- **Items**:
  - Daily Reminders - Set appreciation reminders
  - Nudge Settings - Random partner reminders
  - Language Settings - Shows current language
  - Change Password - Update your password

#### 3. Tools (Purple)
- **Icon**: Wrench
- **Items**:
  - Invite Partner - Send connection request

#### 4. Help (Gray)
- **Icon**: HelpCircle
- **Items**:
  - FAQ - Common questions
  - Video Guides - Watch how-to videos
  - Contact Us - Get help or report issues

#### 5. Legal (Light Gray)
- **Icon**: Info
- **Items**:
  - Terms of Service
  - Privacy Policy
  - Impressum
  - Version - Shows app version and build number

### Visual Design

- **Section Headers**: Icon with colored background + section title
- **Menu Items**: 
  - Icon 
  - Title and subtitle
  - Chevron right for navigation
  - Tap feedback
- **Card Style**: Each section in elevated card with shadows
- **Sign Out Button**: Separate card at bottom with red text

### Navigation

- All items navigate to screens in `/(more)/` group
- Back navigation via ArrowLeft button
- Consistent header pattern across all sub-screens

### Data

- Fetches user info from `users` table
- Shows partner connection status
- Loads language preference from AsyncStorage
- Version info from Expo Constants
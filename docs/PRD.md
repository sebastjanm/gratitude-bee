# Gratitude Bee - Product Requirements Document

**Last Updated: 2025-08-06**  
**Status: Production Implementation**

## 1. Introduction

**Gratitude Bee** is a mobile application designed for couples to strengthen their relationship by encouraging consistent, positive interactions and providing tools for healthy communication. The app gamifies appreciation, allowing partners to send and receive virtual badges for various positive actions, while also offering mechanisms for accountability and connection.

The core purpose is to build a "bank of goodwill" between partners, making gratitude a daily habit and providing a private, joyful space to celebrate the small things that make a relationship great.

---

## 2. Core Concepts

The application revolves around a few key concepts, detailed further in our [Points & Economy System](./PointsEconomy.md) documentation.

*   **Appreciation Badges:** Positive acknowledgments sent between partners. Each badge belongs to a category and carries a specific point value, which contributes to the receiver's category-specific **Appreciation Points** balance.
*   **Hornets (Negative Badges):** A tool for accountability. Sending a Hornet deducts a significant number of points from the receiver's **Hornet Stings** balance.
*   **Favors:** A system where partners can request help using **Favor Points**. The requester "spends" points, and the completer "earns" them, maintaining a balanced internal economy.
*   **Pings:** Urgent, non-verbal nudges. A small point value is awarded to the receiver upon responding, encouraging prompt communication.
*   **Message-Only Events:** Actions like "Don't Panic" and "Relationship Wisdom" are logged for timeline history but carry no point value.
*   **User Wallets:** Each user has a wallet that tracks their distinct point balances for Appreciations, Favors, and Hornets.
*   **Event Ledger:** Every interaction (badge sent, favor requested, etc.) is recorded as an immutable event in a central ledger. This provides a complete historical record, capturing who sent what to whom, when it happened, and any associated message or data. This ledger is the source of truth for the Timeline and all analytics.
*   **Dynamic Event Templates:** All badge, favor, and hornet types are defined in the database and manageable by an admin, allowing for dynamic content updates without requiring an app release.
*   **Push Notifications:** All significant partner interactions (new badges, favor requests, pings, etc.) trigger an immediate push notification to the receiving user's device to ensure timely communication.
*   **Real-time Chat:** ✅ **IMPLEMENTED** - Partners can communicate through a private chat with typing indicators and online/offline status.
*   **Event Reactions:** ✅ **IMPLEMENTED** - Users can react to received events with emojis.

---

## 3. Screens & Features

### 3.1. Authentication Flow ✅ **FULLY IMPLEMENTED**

The authentication flow guides the user through signing up, logging in, and connecting with their partner.

*   **Splash Screen:** The initial loading screen when the app opens.
*   **Welcome Screen:** A screen that introduces the app's value proposition to new users.
*   **Authentication Screen:** A unified screen for both Sign Up and Sign In, using an email/password combination.
*   **Forgot Password:** A standard flow for users to reset their password.
*   **Partner Link:** A crucial step for connecting with a partner. Users can:
    * Share their unique invite code (8-character alphanumeric)
    * Display QR code for easy scanning
    * Enter partner's invite code
    * Scan partner's QR code using device camera

### 3.2. Main Application (Tabs) 

The main app is structured with a bottom tab navigator with the following tabs:

#### 3.2.1. Home Screen ✅ **FULLY IMPLEMENTED**

This is the central hub of the application.

*   **User Welcome:** A personalized greeting to the user.
*   **Today's Stats:** ✅ **IMPLEMENTED** - Displays daily sent/received counts.
*   **Quick Send Actions:** A set of primary and secondary actions for quick access.
    *   **Level 1 Actions (High-frequency):**
        *   **Send Appreciation:** Opens the Appreciation Modal to send a positive badge.
        *   **Ask for a Favor:** Opens the Favors Modal to request a favor.
    *   **Level 2 Actions (Situational):**
        *   **Relationship Wisdom:** Opens the Relationship Wisdom Modal.
        *   **Don't Panic:** Opens the Don't Panic Modal.
        *   **Send Hornet:** Opens the Negative Badge (Hornet) Modal.
        *   **Send a Ping:** Opens the Ping Modal for urgent check-ins.
*   **Today's Tip:** A card that offers a daily suggestion to encourage positive interaction.

#### 3.2.2. Chat Screen ✅ **IMPLEMENTED** (Not in original PRD)

Real-time messaging between partners:
*   **Message History:** Scrollable chat history with date separators
*   **Typing Indicators:** Shows when partner is typing
*   **Online/Offline Status:** Real-time partner status in header
*   **Connection Status:** Shows connection state with auto-reconnect
*   **Message Features:** Text messages with timestamps

#### 3.2.3. Rewards Screen ✅ **IMPLEMENTED** (Replaces "Badges")

Combined rewards and achievements system:
*   **Points Balance:** Current balance for all point types
*   **Badge Collection:** All earned badges grouped by category
*   **Achievements:** ✅ **BONUS FEATURE** - Gamified milestones and achievements
*   **Category Filters:** Filter badges by category
*   **Stats Summary:** Total badges, hornets, and tier counts

#### 3.2.4. Activity Screen ✅ **IMPLEMENTED** (Replaces "Timeline")

Chronological history of all interactions:
*   **Timeline View:** All events with sender/receiver, messages, and timestamps
*   **Filtering:** "All Events," "Sent," "Received" filters (default: Received)
*   **Pull to Refresh:** ✅ **IMPLEMENTED**
*   **Human-Readable Timestamps:** ✅ **IMPLEMENTED** (e.g., "5m ago")
*   **Event Reactions:** ✅ **IMPLEMENTED** - Tap to react to received events
*   **Favor Status:** Shows pending/accepted/completed status

#### 3.2.5. More Screen ✅ **IMPLEMENTED** (Replaces "Profile")

Settings and account hub:
*   **Profile Management:** Edit display name and avatar
*   **Analytics:** ✅ **MOVED HERE** - Relationship insights and statistics
*   **Settings Sections:**
    *   **Account:** Profile editing
    *   **Notifications:** Push notification preferences
    *   **Help:** FAQ and video guides ✅ **ENHANCED**
    *   **Language:** ✅ **BONUS FEATURE** - Multi-language support
    *   **Legal:** Terms, Privacy, Impressum
*   **Sign Out:** Logout functionality

---

## 4. Modals ✅ **FULLY IMPLEMENTED**

Modal windows are used for all primary user actions to keep the interface focused.

*   **Appreciation Modal:** Browse categories and select badges to send
*   **Favors Modal:** Request predefined or custom favors with point values
*   **Relationship Wisdom Modal:** Send non-confrontational wisdom messages
*   **Don't Panic Modal:** Send calming messages to stressed partner
*   **Negative Badge (Hornet) Modal:** Send hornets with severity levels and confirmation
*   **Ping Modal:** Quick urgent check-in messages
*   **QR Code Modal:** ✅ **IMPLEMENTED** - Display invite QR code
*   **Reaction Modal:** ✅ **IMPLEMENTED** - React to received events

---

## 5. Analytics Features ✅ **PARTIALLY IMPLEMENTED**

Located in More > Analytics:
*   **Key Stats:** Total Sent/Received, Current Streak, Daily Average
*   **Time Filtering:** Today, This Week, This Month, All Time
*   **Category Breakdown:** Most used categories for sent/received
*   ❌ **Weekly Breakdown Chart:** Not implemented
*   ❌ **Insights & Patterns:** Not implemented

---

## 6. Features Not Yet Implemented ❌

*   **Admin Panel:** Template management interface for admins
*   **Weekly Goals:** Setting and tracking badge goals
*   **Memory Book Export:** Export relationship history
*   **Advanced Analytics:** Weekly charts and pattern insights

---

## 7. Technical Implementation ✅

*   **Frontend:** React Native with Expo SDK 52
*   **Backend:** Supabase (PostgreSQL, Edge Functions, Realtime)
*   **State Management:** React Query + React Context
*   **Push Notifications:** Expo Push Service
*   **Real-time Features:** 
    * Postgres Changes (message sync)
    * Broadcast (typing indicators)
    * Presence (online status)

---

## 8. Data Categories & Definitions

This section outlines the primary data categories used throughout the app.

*   **Appreciation Categories:** Kindness, Support, Humor, Adventure, Love Notes
*   **Relationship Wisdom Categories:** Whatever You Say, Yes Dear, Happy Wife Happy Life, I'm Sorry
*   **Hornet Severities:** Light Misunderstanding, Not OK, Clusterfuck
*   **Favor Categories:** Food & Drinks, Errands & Shopping, Home Help, Treats
*   **Ping Urgency Levels:** Just checking in, A bit worried, URGENT

---

## Implementation Status Summary

**Core Features:** 100% Complete ✅
- All authentication flows
- Event system (appreciations, favors, hornets, etc.)
- Push notifications
- Points economy
- Dynamic templates

**Enhanced Features:** Added beyond PRD 🎯
- Real-time chat system
- Achievement system
- Event reactions
- QR code invites
- Multi-language support

**Missing Features:** Not yet implemented ❌
- Admin panel
- Goal setting
- Memory book export
- Advanced analytics visualizations

The application exceeds the original PRD specifications in many areas while maintaining the core vision of strengthening relationships through gamified appreciation.
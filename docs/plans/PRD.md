# Gratitude Bee - Product Requirements Document

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

---

## 3. Screens & Features

### 3.1. Authentication Flow

The authentication flow guides the user through signing up, logging in, and connecting with their partner.

*   **Splash Screen:** The initial loading screen when the app opens.
*   **Welcome Screen:** A screen that introduces the app's value proposition to new users.
*   **Authentication Screen:** A unified screen for both Sign Up and Sign In, using an email/password combination.
*   **Forgot Password:** A standard flow for users to reset their password.
*   **Partner Link:** A crucial step for connecting with a partner. A user can either **share their unique, auto-generated invite code** with their partner, or they can **enter the invite code** they received from their partner. This ensures a secure and unambiguous link between the two accounts.

### 3.2. Main Application (Tabs)

The main app is structured with a bottom tab navigator.

#### 3.2.1. Home Screen

This is the central hub of the application.

*   **User Welcome:** A personalized greeting to the user.
*   **Streak Card:** Displays the user's current daily streak of activity and the total number of badges exchanged between the partners.
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

#### 3.2.2. Timeline Screen

This screen provides a chronological history of all interactions between the partners.

*   **Timeline View:** A vertical list of all sent and received badges, hornets, and other events. Each entry displays the badge name, sender/receiver, a message (if included), and a timestamp.
*   **Filtering:** Users can filter the timeline to view "All Events," "Sent" events only, or "Received" events only.

#### 3.2.3. Badges Screen

This screen serves as a trophy room, displaying all the badges the user has earned.

*   **Badge Collection:** A list of all earned badges, grouped by category. Each badge displays its name, description, tier (Bronze, Silver, Gold), and the date it was earned.
*   **Stats:** A summary of the user's collection, showing total positive badges, total hornets, and counts for each tier.
*   **Category Filters:** Users can filter their collection to view badges from a specific category (e.g., "Kindness," "Humor").

#### 3.2.4. Analytics Screen

This screen provides deeper insights into the relationship's interaction patterns.

*   **Key Stats:** A high-level overview of important metrics like Total Sent, Total Received, Current Streak, and Daily Average.
*   **Time-based Filtering:** Users can filter all analytics on this screen by "This Week," "This Month," or "All Time."
*   **Weekly Breakdown:** A bar chart visualizing the volume of positive vs. negative interactions over the past few weeks.
*   **Category Breakdown:** A detailed look at which appreciation categories are used most frequently, showing both sent and received counts.
*   **Insights & Patterns:** A list of qualitative insights, such as the "Most Active Day" for sending badges and each partner's "Favorite Category."

#### 3.2.5. Profile Screen

This screen contains user account information, settings, and app-level actions.

*   **User Info:** Displays the user's name and their partner's connection status.
*   **Personal Stats:** A summary of the user's personal activity (Badges Sent, Badges Received, etc.).
*   **Settings:**
    *   **Admin Panel:** (Visible to admins only) An interface to manage all event templates, including adding, editing, or deleting appreciation badges, favors, and hornets.
    *   **Connection:** Displays the user's invite code to share with their partner. Options to invite a partner and export the relationship history as a "Memory Book."
    *   **Notifications:** Toggles for daily reminders and random "nudges," and management of the user's Expo Push Token.
    *   **Goals:** Setting and tracking weekly badge goals.
    *   **Support:** Access to Help/FAQs and the Sign Out function.

---

## 4. Modals

Modal windows are used for all primary user actions to keep the interface focused.

*   **Appreciation Modal:** Allows the user to browse through different categories of appreciation (Support, Kindness, etc.) and select a specific badge to send.
*   **Favors Modal:** Allows a user to request a predefined or custom favor from their partner, setting a point value for the task.
*   **Relationship Wisdom Modal:** Presents a list of "wisdom" options for the user to send as a non-confrontational response.
*   **Don't Panic Modal:** Offers a selection of pre-written, calming messages to send to a partner who is stressed.
*   **Negative Badge (Hornet) Modal:** Allows the user to send a "Hornet" by selecting the severity of the issue. It includes a field for an optional message and requires confirmation due to its impact (canceling positive badges).
*   **Ping Modal:** Provides a list of urgent, predefined messages for quick check-ins.

---

## 5. Data Categories & Definitions

This section outlines the primary data categories used throughout the app.

*   **Appreciation Categories:** Kindness, Support, Humor, Adventure, Love Notes.
*   **Relationship Wisdom Categories:** Whatever You Say, Yes, Dear, Happy Wife, Happy Life, I'm Sorry.
*   **Hornet Severities:** Light Misunderstanding, Not OK, Clusterfuck.
*   **Favor Categories:** Food & Drinks, Errands & Shopping, Home Help, Treats.
*   **Ping Urgency Levels:** Just checking in, A bit worried, URGENT. 
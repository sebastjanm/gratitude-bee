# Gratitude Bee - Product Requirements Document

## 1. Introduction

**Gratitude Bee** is a mobile application designed for couples to strengthen their relationship by encouraging consistent, positive interactions and providing tools for healthy communication. The app gamifies appreciation, allowing partners to send and receive virtual badges for various positive actions, while also offering mechanisms for accountability and connection.

The core purpose is to build a "bank of goodwill" between partners, making gratitude a daily habit and providing a private, joyful space to celebrate the small things that make a relationship great.

---

## 2. Core Concepts

The application revolves around a few key concepts:

*   **Appreciation Badges:** These are positive acknowledgments that one partner sends to another. They are categorized to cover different aspects of a relationship, such as Kindness, Support, and Humor. Each badge has a title, description, and a value ("BeeCount").
*   **Hornets (Negative Badges):** A tool for accountability. When a partner's actions are hurtful or problematic, a "Hornet" can be sent. This action is not about punishment but about flagging a significant issue that needs to be addressed. Sending a Hornet cancels out a number of previously earned positive badges.
*   **Favors:** A system where partners can request help from each other using "favor points." When a favor is completed, the partner who did the favor earns the points. This creates a balanced system of give-and-take.
*   **Don't Panic:** A feature for sending immediate comfort and reassurance during stressful moments. It provides pre-defined calming messages to support a partner when they need it most.
*   **Relationship Wisdom:** A set of pre-defined, non-confrontational responses for common relationship scenarios, acknowledging the wisdom of compromise and partnership intelligence (e.g., "Yes, Dear," "I'm Sorry").
*   **Pings:** An urgent, non-verbal "nudge" to get a partner's attention for time-sensitive check-ins, such as confirming their safety.

---

## 3. Screens & Features

### 3.1. Authentication Flow

The authentication flow guides the user through signing up, logging in, and connecting with their partner.

*   **Splash Screen:** The initial loading screen when the app opens.
*   **Welcome Screen:** A screen that introduces the app's value proposition to new users.
*   **Authentication Screen:** A unified screen for both Sign Up and Sign In, using an email/password combination.
*   **Forgot Password:** A standard flow for users to reset their password.
*   **Partner Link:** A crucial step where a user can invite their partner to connect their accounts via a unique link, enabling the core functionality of the app.

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
    *   **Connection:** Options to invite a partner and export the relationship history as a "Memory Book."
    *   **Notifications:** Toggles for daily reminders and random "nudges."
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
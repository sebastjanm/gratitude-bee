# Gratitude Bee - Points & Economy System

This document details the internal economy of the Gratitude Bee app, including how points are earned, spent, and tracked. This system is designed to be flexible and extensible.

---

## 1. Core Principle: The Ledger System

All point-based interactions are recorded as immutable **events** in a central ledger. This ledger is the absolute source of truth for every action taken in the app.

To ensure fast and efficient access to user balances, a separate **wallet** table stores the *current, aggregated totals* for each user. This wallet is automatically updated by the database whenever a new event is recorded, meaning we get the benefits of a full audit trail without sacrificing performance.

---

## 2. User Wallets

Each user has a "wallet" that tracks their various point balances. These balances are always displayed separately to the user and are not combined into a single score.

The primary balances are:

*   **Appreciation Points:** A collection of points earned from receiving positive badges. These are tracked *per category*.
    *   Example Balance: `{ "kindness": 4, "support": 5, "humor": 7, ... }`
*   **Favor Points:** A single balance of points earned by completing favors for their partner. These points can then be "spent" to request new favors.
*   **Hornet Stings:** A running total of negative points received from Hornets. This is purely for tracking and accountability.

---

## 3. Event Types & Point Logic

This section details how each user action affects the wallet balances.

### 3.1. Appreciation Events
*   **Action:** User A sends an Appreciation Badge to User B.
*   **Trigger:** Immediate.
*   **Notification:** User B receives a push notification: *"You've received a 'Kindness' badge from [User A's Name]!"*
*   **Point Logic:**
    *   The `beeCount` associated with the badge is added to User B's **Appreciation Points** wallet, under the corresponding category.
    *   Example: A "Kindness" badge with a `beeCount` of 4 adds 4 points to the `kindness` balance in User B's wallet.
*   **Data Stored in Event:** `category_id`, `badge_id`, `title`, `beeCount`.

### 3.2. Favor Events
Favors have a multi-step lifecycle.

*   **Action 1: Request**
    *   User A requests a favor from User B, specifying a point value.
    *   **Notification:** User B receives a push notification: *"[User A's Name] has requested a favor: 'Bring Me Coffee'."*
    *   **Point Logic:** User A's **Favor Points** balance is checked. If they have enough points to cover the request, the event is created with a `pending` status. The points are "escrowed" (deducted from their spendable balance) but not yet awarded.
*   **Action 2: Acceptance & Completion**
    *   User B accepts and marks the favor as complete.
    *   **Trigger:** User B's action.
    *   **Point Logic:**
        *   The event status is updated to `completed`.
        *   The specified points are added to User B's **Favor Points** wallet.
*   **Data Stored in Event:** `favor_id`, `title`, `description`, `points`, `status` (`pending`, `completed`, `declined`).

### 3.3. Hornet Events
*   **Action:** User A sends a Hornet to User B.
*   **Trigger:** Immediate, after user confirmation.
*   **Notification:** User B receives a push notification: *"[User A's Name] has sent you a 'Hornet Alert'."*
*   **Point Logic:**
    *   The negative point value of the Hornet is added to User B's **Hornet Stings** balance.
    *   This action also triggers the cancellation of a corresponding number of positive badges, which will be handled by application logic (not a direct database transaction).
*   **Data Stored in Event:** `hornet_id`, `title`, `severity`, `points`.

### 3.4. Ping Events
Pings are conditional and only award points upon a specific response.

*   **Action 1: Send Ping**
    *   User A sends a Ping to User B.
    *   **Notification:** User B receives a high-priority push notification: *"[User A's Name] is pinging you: 'URGENT: Are you safe?'"*
    *   **Point Logic:** No points are exchanged. An event is created with a `pending_response` status.
*   **Action 2: Respond to Ping**
    *   User B responds by clicking one of the predefined replies (e.g., "I'm OK").
    *   **Trigger:** User B's response.
    *   **Point Logic:**
        *   A small, predefined number of points (e.g., 1 point) is awarded to User B's **Appreciation Points** wallet under a special "ping_response" category. This rewards their promptness.
        *   The event status is updated to `responded`.
*   **Data Stored in Event:** `ping_id`, `title`, `status` (`pending_response`, `responded`).

### 3.5. Message-Only Events
*   **Actions:** "Relationship Wisdom" and "Don't Panic" events.
*   **Notification:** User B receives a push notification with the message content: *"[User A's Name] sent you a message: 'Everything will be okay ❤️...'"*
*   **Point Logic:** These events carry **zero points**. They are recorded in the ledger for timeline purposes but do not affect any user wallets.
*   **Data Stored in Event:** `message_id`, `title`, `message_text`. 
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

*   **Appreciation Points (Level 1):** A collection of points earned from receiving positive badges. These are tracked *per category* within a `jsonb` field.
    *   Example Balance: `{ "kindness": 4, "support": 5, "humor": 7 }`
*   **Favor Points (Level 1):** A single balance of points earned by completing favors for a partner. These points can then be "spent" to request new favors.
*   **Wisdom Points (Level 2):** Points earned by receiving "Wisdom" messages.
*   **Ping Points (Level 2):** Points earned by promptly responding to a "Ping."
*   **Don't Panic Points (Level 2):** Points earned from receiving a "Don't Panic" message.
*   **Hornet Stings (Level 3):** A running total of negative points received from Hornets. This is purely for tracking and accountability.

---

## 3. Event Types & Point Logic

This section details how each user action affects the wallet balances.

### 3.1. Appreciation Events
*   **Action:** User A sends an Appreciation Badge to User B.
*   **Trigger:** Immediate.
*   **Notification:** User B receives a push notification: *"You've received a 'Kindness' badge from [User A's Name]!"*
*   **Point Logic:**
    *   The `points` associated with the badge is added to User B's **Appreciation Points** wallet, under the corresponding category.
    *   Example: A "Kindness" badge with `points` of 4 adds 4 points to the `kindness` balance in User B's wallet.
*   **Data Stored in Event:** `category_id`, `badge_id`, `title`, `points`, `points_icon`, `point_unit`.

### 3.2. Favor Events
Favors have a multi-step lifecycle to ensure fairness and clarity for both partners.

*   **Action 1: Request (by User A)**
    *   User A requests a favor from User B. The app checks if User A has enough points to "afford" the favor.
    *   **Notification:** User B receives a push notification: *"[User A's Name] has requested a favor: 'Bring Me Coffee'."*
    *   **Point Logic:** No points are transferred yet. An event is created with a `PENDING` status. The points are effectively held in escrow until the favor is completed.

*   **Action 2: Response (by User B)**
    *   User B can either `ACCEPT` or `DECLINE` the favor request.
    *   **Notification:** User A receives a push notification informing them of the decision: *"Your favor request 'Bring Me Coffee' was accepted!"* or *"...was declined."*
    *   **Point Logic:** 
        *   If accepted, the event status is updated to `ACCEPTED`.
        *   If declined, the event status is updated to `DECLINED`.
        *   No points are transferred at this stage.

*   **Action 3: Confirmation (by User A)**
    *   After User B has performed the favor, User A (the original requester) must confirm that it was done.
    *   **Trigger:** User A clicks the "Mark as Complete" button.
    *   **Notification:** User B receives a final confirmation: *"Your favor 'Bring Me Coffee' was marked complete. You earned 5 points!"*
    *   **Point Logic:**
        *   The event status is updated to `COMPLETED`.
        *   The specified points are now officially transferred from User A's balance to User B's balance in the `wallets` table.
*   **Data Stored in Event:** `category_id`, `favor_id`, `title`, `description`, `points`, `icon`, `points_icon`, `notification_text`, `status` (`PENDING`, `ACCEPTED`, `DECLINED`, `COMPLETED`).

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
        *   A small, predefined number of points (e.g., 1 point) is awarded to User B's **Ping Points** wallet. This rewards their promptness.
        *   The event status is updated to `responded`.
*   **Data Stored in Event:** `ping_id`, `title`, `status` (`pending_response`, `responded`).

### 3.5. Message-Only & Wisdom Events

#### Relationship Wisdom
*   **Action:** User A sends a "Wisdom" message to User B.
*   **Notification:** User B receives a push notification with the message content.
*   **Point Logic:** The points defined in the chosen `wisdom_template` are added to User B's **Wisdom Points** balance.
*   **Data Stored in Event:** `template_id`, `title`, `description`, `points`.

#### Don't Panic
*   **Action:** User A sends a "Don't Panic" message to User B.
*   **Notification:** User B receives a push notification with the message content.
*   **Point Logic:** A fixed number of points (currently 1) is added to User B's **Don't Panic Points** balance. (This will be updated to use a template system in the future).
*   **Data Stored in Event:** `message_id`, `title`. 
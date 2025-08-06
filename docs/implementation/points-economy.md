# Gratitude Bee - Points & Economy System

This document details the internal economy of the Gratitude Bee app, including how points are earned, spent, and tracked. This system is designed to be flexible and extensible.

---

## 1. Core Principle: The Ledger System

All point-based interactions are recorded as immutable **events** in a central ledger. This ledger is the absolute source of truth for every action taken in the app.

The events table stores:
- `sender_id` and `receiver_id` (user references)
- `event_type` (APPRECIATION, FAVOR_REQUEST, HORNET, PING, etc.)
- `status` (PENDING, ACCEPTED, DECLINED, COMPLETED)
- `content` (JSONB containing template_id and other event-specific data)
- `reaction` (emoji reactions added to events)

To ensure fast and efficient access to user balances, a separate **wallet** table stores the *current, aggregated totals* for each user. This wallet is automatically updated by the database whenever a new event is recorded, meaning we get the benefits of a full audit trail without sacrificing performance.

**Important Implementation Note:** All point values are looked up from template tables on the server side via the `handle_event_points` database trigger function. The client only sends `template_id` references, never point values directly. This ensures security and consistency.

---

## 2. User Wallets

Each user has a "wallet" that tracks their various point balances. These balances are always displayed separately to the user and are not combined into a single score.

The primary balances are:

*   **Appreciation Points (Level 1):** A collection of points earned from receiving positive badges. These are tracked *per category* within a `jsonb` field.
    *   Example Balance: `{ "kindness": 4, "support": 5, "humor": 7 }`
*   **Favor Points (Level 1):** A single balance of points earned by completing favors for a partner. These points can then be "spent" to request new favors.
*   **Wisdom Points (Level 2):** Points earned by receiving "Wisdom" messages.
*   **Ping Points (Level 2):** Points earned by responding to a "Ping" (response feature not yet implemented in UI).
*   **Don't Panic Points (Level 2):** Points earned from receiving a "Don't Panic" message.
*   **Hornet Stings (Level 3):** A running total of negative points received from Hornets. This is purely for tracking and accountability.

---

## 3. Event Types & Point Logic

This section details how each user action affects the wallet balances.

### 3.1. Appreciation Events
*   **Action:** User A sends an Appreciation Badge to User B.
*   **Trigger:** Immediate.
*   **Notification:** User B receives a push notification with the template's notification_text.
*   **Point Logic:**
    *   Points are looked up from `appreciation_templates` table using template_id.
    *   Points are added to User B's **Appreciation Points** wallet under the corresponding category.
    *   Example: A "Kindness" badge with 4 points adds 4 to the `kindness` balance in User B's wallet.
*   **Data Stored in Event:** `template_id` and `category_id` referencing `appreciation_templates` table.

### 3.2. Favor Events
Favors have a multi-step lifecycle to ensure fairness and clarity for both partners.

*   **Action 1: Request (by User A)**
    *   User A requests a favor from User B. The app checks if User A has enough points to "afford" the favor.
    *   **Notification:** User B receives a push notification: *"[User A's Name] has requested a favor: 'Bring Me Coffee'."*
    *   **Point Logic:** No points are transferred yet. An event of type `FAVOR_REQUEST` is created with a `PENDING` status.

*   **Action 2: Response (by User B)**
    *   User B can either accept or decline the favor request from the timeline.
    *   **Notification:** Currently no notification is sent for accept/decline actions.
    *   **Point Logic:** 
        *   If accepted, the original event is updated to type `FAVOR_ACCEPTED` with status `ACCEPTED`.
        *   If declined, the original event is updated to type `FAVOR_DECLINED` with status `DECLINED`.
        *   No points are transferred at this stage.

*   **Action 3: Confirmation (by User A)**
    *   After User B has performed the favor, User A (the original requester) must confirm that it was done.
    *   **Trigger:** User A clicks the "Mark as Complete" button in the timeline.
    *   **Notification:** Currently no notification is sent for favor completion.
    *   **Point Logic:**
        *   The original event is updated to type `FAVOR_COMPLETED` with status `COMPLETED`.
        *   Points are looked up from `favor_templates` table using template_id.
        *   Points are added to User B's favor_points balance (who completed the favor).
*   **Data Stored in Event:** `template_id` referencing `favor_templates` table.

### 3.3. Hornet Events
*   **Action:** User A sends a Hornet to User B.
*   **Trigger:** Immediate, after user confirmation dialog.
*   **Notification:** User B receives a push notification with the hornet message.
*   **Point Logic:**
    *   The negative point value is looked up from `hornet_templates` table using template_id.
    *   Points are added to User B's **Hornet Stings** balance (negative accumulation).
    *   Note: The UI shows "cancels X positive badges" but actual badge cancellation is not implemented.
*   **Data Stored in Event:** `template_id` referencing `hornet_templates` table.

### 3.4. Ping Events
Pings are conditional and only award points upon a specific response.

*   **Action 1: Send Ping**
    *   User A sends a Ping to User B.
    *   **Notification:** User B receives a push notification with the ping message.
    *   **Point Logic:** No points are exchanged. An event of type `PING` is created.
*   **Action 2: Respond to Ping**
    *   Currently, ping response functionality is not implemented in the UI.
    *   **When implemented:** User B would respond by clicking a reply option.
    *   **Point Logic (when implemented):**
        *   A new event of type `PING_RESPONSE` would be created.
        *   Points from `ping_templates` would be awarded to the responding user's **Ping Points** wallet.
*   **Data Stored in Event:** `template_id` referencing `ping_templates` table.

### 3.5. Message-Only & Wisdom Events

#### Relationship Wisdom
*   **Action:** User A sends a "Wisdom" message to User B.
*   **Notification:** User B receives a push notification with the wisdom message.
*   **Point Logic:** 
    *   Points are looked up from `wisdom_templates` table using template_id.
    *   Points are added to User B's **Wisdom Points** balance.
*   **Data Stored in Event:** `template_id` referencing `wisdom_templates` table.

#### Don't Panic
*   **Action:** User A sends a "Don't Panic" message to User B.
*   **Notification:** User B receives a push notification with the calming message.
*   **Point Logic:** 
    *   Points are looked up from `dont_panic_templates` table using template_id.
    *   Points are added to User B's **Don't Panic Points** balance.
*   **Data Stored in Event:** `template_id` referencing `dont_panic_templates` table. 
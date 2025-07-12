
# Notification Storage and Interaction Implementation Plan

This document outlines the plan to implement a robust notification system that includes storing notifications in the database and adding interactive elements.

## Phase 1: Foundational Setup

### Step 1: Database Schema

Create a new table named `notifications` in the Supabase database. This table will store a persistent record of every notification sent.

**SQL Schema:**

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES profiles(id),
    sender_id UUID NOT NULL REFERENCES profiles(id),
    type TEXT NOT NULL,
    content JSONB NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications (to mark as read)"
ON notifications
FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Service roles can insert notifications"
ON notifications
FOR INSERT WITH CHECK (true);
```

### Step 2: Update Supabase Function to Store Notifications

Modify the existing `send-notification` Edge Function (`supabase/functions/send-notification/index.ts`). Before sending the push notification, it must first insert a record into the new `notifications` table.

### Step 3: Create Interactive Notification Category

On the client side, in `utils/pushNotifications.ts`, use Expo's `Notifications.setNotificationCategoryAsync` to define a new category for "Appreciation" notifications.

**Category Definition:**
-   **Identifier:** `appreciation`
-   **Actions:**
    -   A button with the title "❤️ Thank You" and an identifier like `thank-you-action`.

### Step 4: Add Global Notification Listener

In the root layout file (`app/_layout.tsx`), implement a `Notifications.addNotificationResponseReceivedListener`. This listener will handle all user interactions with notifications.

**Listener Logic:**
-   **On Notification Tap:**
    1.  Extract the `notification_id` from the notification's data payload.
    2.  Call a new Supabase function (`mark-notification-read`) to update the notification's status in the database.
    3.  Open a modal (`AppreciationDetailModal`) to display the full notification content.
-   **On "❤️ Thank You" Action Tap:**
    1.  Extract sender/recipient details from the notification data.
    2.  Call a new Supabase function (`send-thank-you`) to send a simple appreciative notification back to the original sender.

### Step 5: Create New UI and Helper Functions

-   **`AppreciationDetailModal.tsx`:** A new modal component to display the full content of an appreciation notification. It will also contain a "❤️ Thank You" button.
-   **`send-thank-you` Supabase Function:** An Edge Function that creates a simple "ping"-like notification.
-   **`mark-notification-read` Supabase Function:** An Edge Function that updates the `read` status of a notification in the database.

---

## Future Phases

-   **Phase 2: Interactive "Favor Request" Notifications:**
    -   Create a `favor_request` category with "Accept" and "Decline" buttons.
    -   Build a `FavorRequestDetailModal`.
    -   Implement corresponding backend logic for accepting/declining favors.
-   **Phase 3: Interactive "Ping" Notifications:**
    -   Create a `ping` category with an "Acknowledge" or "Ping Back" action.
    -   Implement the logic to handle the acknowledgment.
-   **Phase 4: In-App Notification Center:**
    -   Create a new screen that fetches and displays all notifications from the `notifications` table, showing read/unread status. 
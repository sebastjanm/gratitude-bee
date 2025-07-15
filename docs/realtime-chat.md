# Plan: Simple & Maintainable Real-time Chat Module

This document outlines the phased implementation plan for adding a real-time chat module to the application. The architecture prioritizes simplicity, maintainability, and durability by leveraging Supabase's **Postgres Changes** for message history and **Presence** for online status, adhering to official best practices.

## Guiding Principles

- **KISS (Keep It Simple, Stupid):** Avoid over-engineering. Build a lean, manageable system suitable for a solo developer.
- **DRY (Don't Repeat Yourself):** Use functions and triggers to automate processes.
- **Single Source of Truth:** The Postgres database is the definitive source for all chat history.
- **Security First:** Implement strict Row Level Security (RLS) from the beginning.

---

## Phase 1: Backend Foundation (Supabase)

This phase focuses on creating a minimal, secure, and efficient database schema without modifying existing tables.

### Step 1.1: Create Chat Tables

Create three new tables to form the core of the chat system.

-   **`conversations`**: Stores metadata for each chat thread.
    -   `id` (uuid, pk)
    -   `last_message` (text, nullable)
    -   `last_message_sent_at` (timestamptz, nullable)
-   **`messages`**: Stores individual chat messages.
    -   `id` (uuid, pk)
    -   `conversation_id` (uuid, fk -> conversations.id)
    -   `sender_id` (uuid, fk -> users.id)
    -   `text` (text)
    -   `created_at` (timestamptz)
-   **`conversation_participants`**: Links users to conversations.
    -   `id` (uuid, pk)
    -   `conversation_id` (uuid, fk -> conversations.id)
    -   `user_id` (uuid, fk -> users.id)
    -   `UNIQUE` constraint on `(conversation_id, user_id)`

### Step 1.2: Implement Server-Side Logic

Automate database operations to simplify client-side code.

-   **Function `get_or_create_conversation(user_one_id uuid, user_two_id uuid)`**: A reusable function to find or create a 1-on-1 conversation.
-   **Trigger `on_new_message`**: An automated trigger on the `messages` table that updates the `last_message` and `last_message_sent_at` fields in the corresponding `conversations` row.

### Step 1.3: Configure Realtime & RLS

Enable real-time functionality and secure the data.

-   **Enable Replication**: In the Supabase Dashboard (`Database` > `Replication`), enable replication for the `conversations` and `messages` tables. This is required for Postgres Changes to work.
-   **Row Level Security (RLS)**:
    -   Implement strict RLS policies ensuring users can only read/write data in conversations they are a participant in.
    -   Thoroughly test policies to prevent data leaks or silent failures.

### Step 1.4: Create Migration File

Consolidate all SQL from the steps above into a single, timestamped migration file in the `supabase/migrations/` directory.

---

## Phase 2: Frontend Scaffolding

Set up the necessary UI screens and navigation structure.

### Step 2.1: Add "Messages" Tab

Integrate a new tab into the main tab navigator in `app/(tabs)/_layout.tsx`.

### Step 2.2: Create Conversation List Screen

Create a new file at `app/(tabs)/messages.tsx`. This screen will list all of the user's ongoing conversations.

### Step 2.3: Create Chat Screen

Create a new dynamic route file at `app/chat/[conversation_id].tsx`. This screen will display the chat interface for a selected conversation.

---

## Phase 3: UI & Realtime Logic Implementation

Connect the frontend to the backend using official, documented patterns.

### Step 3.1: Install Dependencies

Add the `react-native-gifted-chat` library to the project to handle the chat UI.

### Step 3.2: Implement Conversation List Logic

-   Fetch the initial list of conversations for the current user.
-   Subscribe to **Postgres Changes** on the `conversations` table to see live updates to the `last_message` preview.

### Step 3.3: Implement Core Chat Experience

-   **Realtime Subscription**:
    -   On mount in the chat screen, create a single channel for the current conversation (e.g., `chat:[conversation_id]`).
    -   Subscribe to **Postgres Changes** for `INSERT` events on the `messages` table, filtered to the current `conversation_id`.
    -   On unmount, cleanly unsubscribe from the channel (`supabase.removeChannel(channel)`).
-   **Sending Messages**: Implement a simple function that performs a single `INSERT` into the `messages` table.
-   **UI & Data Loading**:
    -   Use `react-native-gifted-chat` for the chat interface.
    -   Fetch an initial batch of the latest messages upon loading the screen.

### Step 3.4: Style the Chat UI

Customize the appearance of `react-native-gifted-chat` to align with the app's existing visual identity.

---

## Phase 4: Documentation

### Step 4.1: Update `implementation-flow.md`

Update the existing `docs/implementation-flow.md` file to reflect the addition of the new chat module, linking to this document for the detailed plan. 
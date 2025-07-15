# Real-time Chat Architecture

This document outlines the architecture of the real-time chat module. The system is built on Supabase, leveraging **Postgres Changes** for message history and **Presence** for online status, adhering to official best practices for a simple, maintainable, and durable implementation.

## Guiding Principles

- **KISS (Keep It Simple, Stupid):** The architecture avoids over-engineering, resulting in a lean, manageable system.
- **DRY (Don't Repeat Yourself):** Reusable functions and database triggers automate common processes.
- **Single Source of Truth:** The Postgres database is the definitive source for all chat history.
- **Security First:** Strict Row Level Security (RLS) is implemented on all chat-related tables.

---

## Backend Architecture (Supabase)

The backend is built with three core tables, server-side logic to simplify client operations, and robust security policies.

### Database Schema

#### `conversations` Table
Stores metadata for each chat thread.
- `id` (uuid, pk)
- `last_message` (text, nullable)
- `last_message_sent_at` (timestamptz, nullable)

#### `messages` Table
Stores individual chat messages.
- `id` (uuid, pk)
- `conversation_id` (uuid, fk -> conversations.id)
- `sender_id` (uuid, fk -> users.id)
- `text` (text)
- `created_at` (timestamptz)

#### `conversation_participants` Table
Links users to conversations, forming a many-to-many relationship.
- `id` (uuid, pk)
- `conversation_id` (uuid, fk -> conversations.id)
- `user_id` (uuid, fk -> users.id)
- `UNIQUE` constraint on `(conversation_id, user_id)`

#### Additions to `users` Table
To support chat features, two columns were added to the existing `public.users` table:
- `avatar_url` (text, nullable): Stores a URL to the user's avatar image, displayed in the chat UI.
- `last_seen` (timestamptz, nullable): Tracks the last time the user was active in the app.

### Server-Side Logic

- **Function `get_or_create_conversation(user_one_id uuid, user_two_id uuid)`**: A reusable function to find or create a 1-on-1 conversation, preventing duplicate conversation threads between the same two users.
- **Trigger `on_new_message`**: An automated trigger on the `messages` table that updates the `last_message` and `last_message_sent_at` fields in the corresponding `conversations` row. This keeps the conversation list preview up-to-date without extra client-side logic.

### Realtime & Row Level Security (RLS)

- **Postgres Changes**: Replication is enabled on the `conversations` and `messages` tables, allowing the client to subscribe to database changes in real-time.
- **RLS Policies**: Strict RLS policies are implemented to ensure users can only access data from conversations they are a participant in. This is the cornerstone of the chat module's security.

### Migrations
All schema changes are consolidated into version-controlled migration files located in `supabase/migrations/`:
- `20240722120000_create_chat_module.sql`: Defines the core chat tables and logic.
- `20250720000000_fix_profile_rls.sql`: Corrects and adds RLS policies for user data access.
- `20250722000000_add_last_seen_to_users.sql`: Adds the `last_seen` column to the `users` table.

---

## Frontend Architecture

The frontend consists of a conversation list, a chat screen, and a custom header, all integrated into the existing navigation.

### Key Dependencies
- **`react-native-gifted-chat`**: Provides the core chat UI, including message bubbles, input toolbar, and avatars.
- **`date-fns`**: Used for formatting timestamps, such as the "last seen" status and date separators in the chat view.

### Screens & Components

- **"Messages" Tab**: A dedicated tab in `app/(tabs)/_layout.tsx` for accessing the chat feature.
- **Conversation List Screen (`app/(tabs)/messages.tsx`)**:
    - Displays a list of the user's ongoing conversations.
    - Subscribes to Postgres Changes on the `conversations` table to show a live preview of the last message sent.
- **Chat Screen (`app/chat/[conversation_id].tsx`)**:
    - **Custom Header**: Displays the partner's name, avatar, and "last seen" status (e.g., "Active now", "Active 5m ago").
    - **Realtime Subscription**: Creates a unique Supabase channel for the current conversation (e.g., `chat:[conversation_id]`). It subscribes to `INSERT` events on the `messages` table to append new messages to the UI in real-time.
    - **UI**: Uses `react-native-gifted-chat`, customized to show user avatars and date separators between messages sent on different days.
- **Session Provider (`providers/SessionProvider.tsx`)**:
    - Manages the user's `last_seen` status. It uses React Native's `AppState` to detect when the app becomes active and calls a Supabase Edge Function to update the `last_seen` timestamp in the database.

### Data Flow

1.  **Loading Conversations**: The `messages.tsx` screen fetches all conversations the current user is a part of.
2.  **Entering a Chat**: Navigating to `[conversation_id].tsx` fetches the partner's details (name, avatar, `last_seen`) and the most recent batch of messages.
3.  **Receiving Messages**: The Supabase Realtime subscription listens for new rows in the `messages` table and appends them to the `GiftedChat` component.
4.  **Sending Messages**: A new message is inserted into the `messages` table. The `on_new_message` trigger automatically updates the parent `conversations` table, which in turn updates the conversation list preview for both users in real-time. 
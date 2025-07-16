# Real-time Chat Architecture

This document outlines the architecture and implementation of the real-time chat module. The system is built on Supabase, leveraging **Postgres Changes** for message history and **Presence** for online status, adhering to official best practices for a simple, maintainable, and durable implementation.

## Guiding Principles

- **KISS (Keep It Simple, Stupid):** The architecture avoids over-engineering, resulting in a lean, manageable system.
- **DRY (Don't Repeat Yourself):** Reusable functions and database triggers automate common processes.
- **Single Source of Truth:** The Postgres database is the definitive source for all chat history.
- **Security First:** Strict Row Level Security (RLS) is implemented on all chat-related tables.

---

## Backend Architecture (Supabase)

The backend is built with three core tables, a separate `users` table for public user data, server-side logic to simplify client operations, and robust security policies.

### Database Schema

#### `users` Table
Crucially, public user data is stored in a `users` table, which is linked one-to-one with the private `auth.users` table. This is a Supabase best practice that enhances security by separating public profile data from private authentication credentials.
- `id` (uuid, fk -> auth.users.id, pk)
- `display_name` (text, nullable)
- `avatar_url` (text, nullable): Stores a URL to the user's avatar image.
- `last_seen` (timestamptz, nullable): Tracks the last time the user was active.
- `invite_code` (text, unique)

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
- `text` (text, nullable): The text content of the message.
- `uri` (text, nullable): A URI for image-based messages, pointing to an object in Supabase Storage.
- `created_at` (timestamptz)

#### `conversation_participants` Table
Links users to conversations, forming a many-to-many relationship.
- `id` (uuid, pk)
- `conversation_id` (uuid, fk -> conversations.id)
- `user_id` (uuid, fk -> users.id)
- `UNIQUE` constraint on `(conversation_id, user_id)`

#### Storage Buckets
- **`avatars`**: A dedicated storage bucket for user profile pictures. RLS policies ensure users can only upload/update their own avatar, while all authenticated users can view avatars.
- **`chat-images`**: A storage bucket for images sent in messages. RLS policies ensure only participants of a conversation can upload or view images for that conversation.

### Server-Side Logic

- **Function `get_or_create_conversation(user_one_id uuid, user_two_id uuid)`**: A reusable function to find or create a 1-on-1 conversation, preventing duplicate conversation threads between the same two users.
- **Trigger `on_new_message`**: An automated trigger on the `messages` table that updates the `last_message` and `last_message_sent_at` fields in the corresponding `conversations` row. This keeps the conversation list preview up-to-date without extra client-side logic.

### Realtime & Row Level Security (RLS)

- **Postgres Changes**: Replication is enabled on the `messages` table, allowing the client to subscribe to database changes in real-time.
- **RLS Policies**: Strict RLS policies are implemented to ensure users can only access data from conversations they are a participant in. The use of the `users` table is key to this security model.

### Migrations
All schema changes are version-controlled in `supabase/migrations/`:
- `20240722120000_create_chat_module.sql`: Defines the core chat tables and logic.
- `20250715214352_setup_image_messaging.sql`: Adds the `uri` column to the `messages` table and creates the `chat-images` storage bucket to support image messages.
- `20250720000000_fix_profile_rls.sql`: Corrected RLS policies to properly reference the `users` table, fixing critical data access issues.
- `20250722000000_add_last_seen_to_users.sql`: Adds the `last_seen` column to the `users` table.
- `20250724000000_setup_avatar_storage.sql`: Creates the `avatars` storage bucket and sets its RLS policies.

---

## Frontend Architecture

The frontend consists of a conversation list, a chat screen, a custom header, and an avatar upload feature.

### Key Dependencies
- **`react-native-gifted-chat`**: Provides the core chat UI, including message bubbles, input toolbar, and avatars.
- **`expo-image-picker`**: Allows users to select images from their device's library for avatar uploads or for sending in chat.
- **`date-fns`**: Used for formatting timestamps, such as the "last seen" status.

### The Real-Time Fix: Solving Stale State Closures

The most critical challenge encountered during development was a bug where new real-time messages were received by the client but did not render in the UI without a manual refresh.

- **The Problem:** The `useEffect` hook that established the Supabase Realtime subscription created a "stale closure." The subscription callback function captured the `messages` state from the initial render. When a new message arrived, the callback tried to update the state, but it was operating on the old, empty `messages` array, not the most current one.

- **The Solution:** The fix was to use the **functional update form** of the React state setter. Instead of calling `setMessages([...newMessages, ...messages])`, we switched to `setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages))`. This approach provides the callback with the *most recent* state (`previousMessages`) directly, ensuring that new messages are always appended to the current list, thus bypassing the stale closure problem entirely. This is a robust and standard React pattern for handling state updates that depend on the previous state, especially within callbacks or asynchronous operations.

### Screens & Components

- **Conversation List (`app/(tabs)/messages.tsx`)**: Displays a list of the user's ongoing conversations with real-time previews of the last message.
- **Chat Screen (`app/chat/[conversation_id].tsx`)**:
  - **Routing**: This screen is located at `app/chat/` and is presented as a stack screen, *not* as a direct child of the tab navigator. This was a key fix to resolve routing conflicts with Expo Router.
  - **Custom Header**: Displays the partner's name, avatar, and a real-time "last seen" status.
  - **Realtime Subscription**: Subscribes to new `INSERT` events on the `messages` table for the current conversation, using the stale-state-proof method described above.
- **Avatar Uploads (`app/(tabs)/profile.tsx`)**:
  - Users can tap their avatar to launch the image picker.
  - The selected image is uploaded to the `avatars` Supabase Storage bucket.
  - The user's `avatar_url` in the `users` table is updated with the new public URL.

### Data Flow

1.  **Loading Conversations**: The `messages.tsx` screen fetches all conversations the current user is a participant in.
2.  **Entering a Chat**: Navigating to `[conversation_id].tsx` fetches the partner's profile (`display_name`, `avatar_url`, `last_seen`) and the most recent batch of messages for initial display.
3.  **Receiving Messages**: The Supabase Realtime subscription, safely using a functional state update, listens for new rows in the `messages` table and appends them to the `GiftedChat` component.
4.  **Sending Messages**: A new message is inserted into the `messages` table. The `on_new_message` trigger automatically updates the parent `conversations` table, which in turn updates the conversation list preview for both users in real-time.
# Real-time Chat Architecture

This document outlines the architecture of the real-time chat module. The system is built on Supabase, leveraging **Postgres Changes** for message history and **Presence** for online status, adhering to official best practices for a simple, maintainable, and durable implementation.

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
Crucially, public user data is stored in a `users` table, which is linked one-to-one with the private `auth.users` table. This is a Supabase best practice that enhances security.
- `id` (uuid, fk -> auth.users.id, pk)
- `full_name` (text, nullable)
- `avatar_url` (text, nullable): Stores a URL to the user's avatar image.
- `last_seen` (timestamptz, nullable): Tracks the last time the user was active.

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

#### `storage.objects` for Avatars
A dedicated storage bucket named `avatars` is used to store user profile pictures. RLS policies ensure that users can only upload their own avatar and that all authenticated users can view avatars.

### Server-Side Logic

- **Function `get_or_create_conversation(user_one_id uuid, user_two_id uuid)`**: A reusable function to find or create a 1-on-1 conversation, preventing duplicate conversation threads between the same two users.
- **Trigger `on_new_message`**: An automated trigger on the `messages` table that updates the `last_message` and `last_message_sent_at` fields in the corresponding `conversations` row. This keeps the conversation list preview up-to-date without extra client-side logic.

### Realtime & Row Level Security (RLS)

- **Postgres Changes**: Replication is enabled on the `conversations` and `messages` tables, allowing the client to subscribe to database changes in real-time.
- **RLS Policies**: Strict RLS policies are implemented to ensure users can only access data from conversations they are a participant in. The use of the `users` table is key to this security model, as it separates private auth data from public users data.

### Migrations
All schema changes are version-controlled in `supabase/migrations/`:
- `20240722120000_create_chat_module.sql`: Defines the core chat tables and logic.
- `20250720000000_fix_profile_rls.sql`: Corrected RLS policies to properly reference the `profiles` table, fixing critical data access issues.
- `20250722000000_add_last_seen_to_users.sql`: Adds the `last_seen` column to the `profiles` table.
- `20250724000000_setup_avatar_storage.sql`: Creates the `avatars` storage bucket and sets its RLS policies.

---

## Frontend Architecture

The frontend consists of a conversation list, a chat screen, a custom header, and an avatar upload feature.

### Key Dependencies
- **`react-native-gifted-chat`**: Provides the core chat UI, including message bubbles, input toolbar, and avatars.
- **`expo-image-picker`**: Allows users to select images from their device's library for avatar uploads.
- **`date-fns`**: Used for formatting timestamps, such as the "last seen" status and date separators in the chat view.

### Development Workflow
Due to the inclusion of native modules like `expo-image-picker`, the standard Expo Go client is no longer sufficient. A custom **Development Client** must be built using EAS Build.
- Run `eas build --profile development` to create installable `.apk` and `.ipa` files.
- Install these builds on physical devices or simulators for development and testing.

### Screens & Components

- **"Messages" Tab**: A dedicated tab in `app/(tabs)/_layout.tsx` for accessing the chat feature.
- **Conversation List Screen (`app/(tabs)/messages.tsx`)**:
  - Displays a list of the user's ongoing conversations with real-time previews of the last message.
- **Chat Screen (`app/chat/[conversation_id].tsx`)**:
  - **Custom Header**: Displays the partner's name, avatar, and a real-time "last seen" status.
  - **Realtime Subscription**: Subscribes to new `INSERT` events on the `messages` table for the current conversation.
  - **Android Rendering Fix**: The `GiftedChat` component's underlying `FlatList` uses the `extraData` prop to ensure new messages render correctly on Android.
  - **Keyboard Handling**: Uses a carefully configured `KeyboardAvoidingView` that wraps only the input toolbar to prevent the keyboard from covering the input on both iOS and Android.
- **Avatar Uploads (`Profile` screen)**:
  - Users can tap their avatar to launch the image picker.
  - The selected image is uploaded to the `avatars` Supabase Storage bucket.
  - The user's `avatar_url` in the `users` table is updated with the new public URL.
- **Session Provider (`providers/SessionProvider.tsx`)**:
  - Exposes a `setSession` function, allowing components like the Profile screen to update the global user session instantly after an avatar upload, ensuring the new avatar is displayed immediately across the app.
  - Manages the user's `last_seen` status using `AppState` to detect when the app is active.

### Data Flow

1.  **Loading Conversations**: The `messages.tsx` screen fetches all conversations the current user is a part of.
2.  **Entering a Chat**: Navigating to `[conversation_id].tsx` fetches the partner's profile (`full_name`, `avatar_url`, `last_seen`) and the most recent batch of messages.
3.  **Receiving Messages**: The Supabase Realtime subscription listens for new rows in the `messages` table and appends them to the `GiftedChat` component.
4.  **Sending Messages**: A new message is inserted into the `messages` table. The `on_new_message` trigger automatically updates the parent `conversations` table, which in turn updates the conversation list preview for both users in real-time.
---

I've made the necessary updates to `docs/realtime-chat.md` to reflect the current architecture. The changes include correcting the `users` table to `users`, adding the avatar upload feature, detailing the development workflow with EAS Build, and updating the component descriptions with recent fixes. I'm now applying these changes to the file.
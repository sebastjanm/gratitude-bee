# Real-time Chat Architecture

This document outlines the architecture and implementation of the real-time chat module. The system is built on Supabase and uses **TanStack Query (`useInfiniteQuery`)** for state management, adhering to modern best practices for a performant, maintainable, and robust implementation.

## Guiding Principles

- **KISS (Keep It Simple, Stupid):** The architecture avoids over-engineering by leveraging a powerful state management library.
- **DRY (Don't Repeat Yourself):** Reusable functions and database triggers automate common processes.
- **Single Source of Truth:** The Postgres database is the definitive source for all chat history. TanStack Query acts as a synchronized client-side cache.
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

The frontend consists of a conversation list and a chat screen, powered by modern data-fetching and state management patterns.

### Key Dependencies
- **`@tanstack/react-query`**: Manages all asychronous server state, including message fetching, pagination, and caching.
- **`@dev-plugins/react-query`**: The official Expo Dev Tools plugin for TanStack Query, essential for debugging cache state and query behavior.
- **`react-native-gifted-chat`**: Provides the core chat UI.
- **`expo-image-picker`**: Allows users to select images for sending in chat.
- **`date-fns`**: Used for formatting timestamps.

### The Modernization of Chat: From Manual State to TanStack Query

The most critical challenge during development was a series of bugs related to unreliable message loading and slow real-time updates, particularly on certain Android devices. These issues were solved by replacing a manual, `useState`-based implementation with TanStack Query.

- **The Problems:**
  1.  **Unreliable Pagination:** The initial implementation used offset-based pagination (`.range()`), which caused messages to be skipped or duplicated during active conversations.
  2.  **Inefficient Real-time Updates:** The first attempt at a fix used `queryClient.invalidateQueries`. This triggered a "refetch storm," re-downloading the entire visible chat history for every new message, causing significant performance issues and UI lag.
  3.  **Stale State:** The manual state management was prone to stale closures, where callbacks would operate on outdated state, a common and difficult-to-debug React issue.

- **The Solution: A Robust, Performant Architecture**
  1.  **Cursor-Based Pagination with `useInfiniteQuery`**: The core of the solution was refactoring to `useInfiniteQuery`. This hook manages all the complexity of pagination automatically. It uses the `created_at` timestamp of the oldest message as a "cursor," ensuring that loading more messages is reliable and efficient. It also provides convenient boolean states like `isPending`, `hasNextPage`, and `isFetchingNextPage` out-of-the-box.
  2.  **Instant Real-time Updates with `setQueryData`**: To solve the refetch storm, the Supabase subscription callback was changed to manually update the TanStack Query cache using `queryClient.setQueryData`. When a new message arrives, it is directly injected into the cached data (`data.pages[0]`). This results in an instantaneous UI update with **zero** additional network requests, providing a seamless user experience and dramatically improving performance. This is the official, recommended pattern for handling real-time updates with `useInfiniteQuery`.

### Screens & Components

- **Conversation List (`app/(tabs)/messages/index.tsx`)**: Displays a list of the user's ongoing conversations with real-time previews of the last message.
- **Chat Screen (`app/(tabs)/messages/[conversation_id].tsx`)**:
  - **Custom Header**: Displays the partner's name, avatar, and a real-time "last seen" status.
  - **Data Fetching**: All message fetching and pagination is handled by the `useInfiniteQuery` hook.
  - **Realtime Subscription**: Subscribes to new `INSERT` events on the `messages` table and uses `setQueryData` to instantly update the UI.

### Debugging & Device-Specific Issues

A device-specific bug where a Google Pixel phone failed to refresh the UI was a key driver for this refactor. The final architecture was confirmed to be working correctly using the **`@dev-plugins/react-query`** tool, which allowed us to inspect the query cache and confirm that `invalidateQueries` was causing a refetch storm, leading us to the final `setQueryData` solution. The improved performance of the final solution resolved the issue on the Pixel device.
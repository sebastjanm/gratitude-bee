# Gratitude Bee - Database Schema

This document describes the production database schema for Gratitude Bee.

## Core Tables

### users
Main user profiles table.
- `id` (uuid, PK) - References auth.users
- `display_name` (text) - User's display name
- `partner_id` (uuid, FK) - Connected partner's user ID
- `invite_code` (text, UNIQUE) - Unique code for partner connection
- `expo_push_token` (text) - Push notification token
- `avatar_url` (text) - Profile picture URL
- `last_seen` (timestamptz) - Last activity timestamp
- `email` (text) - User email
- `created_at` (timestamptz) - Account creation date
- `is_admin` (boolean) - Admin privileges flag
- `updated_at` (timestamptz) - Last profile update

### events
Stores all user interactions (appreciations, favors, etc.).
- `id` (bigint, PK, IDENTITY) - Auto-incrementing ID
- `created_at` (timestamptz) - Event timestamp
- `sender_id` (uuid, FK) - User who sent the event
- `receiver_id` (uuid, FK) - User who received the event
- `event_type` (enum) - Type of event (APPRECIATION, FAVOR, etc.)
- `status` (enum) - Event status (for multi-step events like favors)
- `content` (jsonb) - Event-specific data
- `reaction` (text) - Emoji reaction to event

### wallets
Tracks user point balances.
- `user_id` (uuid, PK, FK) - References users.id
- `appreciation_points` (jsonb) - Points by category {"kindness": 10, "humor": 5}
- `favor_points` (integer) - Points for favor economy
- `hornet_stings` (integer) - Negative feedback count
- `wisdom_points` (integer) - Wisdom sharing points
- `ping_points` (integer) - Quick check-in points
- `dont_panic_points` (integer) - Calming message points
- `updated_at` (timestamptz) - Last balance update

## Template Tables

### appreciation_templates
Defines appreciation badges.
- `id` (text, PK) - Unique identifier
- `category_id` (text) - Category (support, kindness, humor, adventure, words)
- `title` (text) - Badge display name
- `description` (text) - Badge description
- `points` (integer) - Points awarded
- `points_icon` (text) - Visual icon for points
- `point_unit` (text) - Name of point type
- `icon` (text) - Badge icon
- `notification_text` (text) - Push notification message
- `is_active` (boolean) - Enable/disable flag

### favor_templates
Defines favor request types.
- `id` (text, PK) - Unique identifier
- `category_id` (text) - Favor category
- `title` (text) - Favor name
- `description` (text) - Favor details
- `points` (integer) - Point cost
- `icon` (text) - Favor icon
- `points_icon` (text) - Points visual
- `notification_text` (text) - Push notification message
- `is_active` (boolean) - Enable/disable flag

### wisdom_templates
Wisdom sharing templates.
- `id` (text, PK) - Unique identifier
- `title` (text) - Wisdom title
- `description` (text) - Wisdom content
- `icon` (text) - Visual icon
- `color` (text) - Theme color
- `points` (integer) - Points awarded
- `points_icon` (text) - Points visual
- `point_unit` (text) - Point type name
- `notification_text` (text) - Push notification
- `is_active` (boolean) - Enable/disable flag
- `created_at` (timestamptz) - Creation timestamp

### ping_templates
Quick check-in templates.
- Same structure as wisdom_templates
- Default points_icon: '🏓'
- Default point_unit: 'ping'

### dont_panic_templates
Calming message templates.
- Same structure as wisdom_templates
- Default points_icon: '⛑️'
- Default point_unit: 'calm'

### hornet_templates
Negative feedback templates.
- `id` (text, PK) - Unique identifier
- `title` (text) - Hornet title
- `description` (text) - Hornet details
- `severity` (text) - Severity level
- `points` (integer) - Negative points
- `icon` (text) - Visual icon
- `is_active` (boolean) - Enable/disable flag

## Chat Module

### conversations
Chat conversation containers.
- `id` (uuid, PK) - Unique conversation ID
- `created_at` (timestamptz) - Creation timestamp
- `last_message` (text) - Preview of last message
- `last_message_sent_at` (timestamptz) - Last activity time

### conversation_participants
Links users to conversations.
- `id` (uuid, PK) - Unique record ID
- `conversation_id` (uuid, FK) - References conversations.id
- `user_id` (uuid, FK) - References users.id

### messages
Individual chat messages.
- `id` (uuid, PK) - Unique message ID
- `created_at` (timestamptz) - Send timestamp
- `conversation_id` (uuid, FK) - Parent conversation
- `sender_id` (uuid, FK) - Message sender
- `text` (text) - Message content
- `uri` (text) - Image attachment URL

### notifications
Push notification records.
- `id` (uuid, PK) - Unique notification ID
- `recipient_id` (uuid, FK) - Target user
- `sender_id` (uuid, FK) - Originating user
- `type` (text) - Notification type
- `content` (jsonb) - Notification data
- `read` (boolean) - Read status
- `created_at` (timestamptz) - Creation timestamp

## Key Relationships

1. **Partner Connection**: users.partner_id → users.id (self-referential)
2. **Events**: Link sender and receiver users
3. **Wallets**: One-to-one with users
4. **Conversations**: Many-to-many with users via participants
5. **Templates**: Referenced in events.content as template_id

## Important Notes

- All timestamps use timezone-aware format (timestamptz)
- JSONB used for flexible content storage
- Row Level Security (RLS) enabled on all tables
- Templates can be modified without app updates
- Point balances automatically updated via triggers
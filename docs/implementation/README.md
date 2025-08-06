# Gratitude Bee - Implementation Documentation

This folder contains documentation for the implementation of Gratitude Bee.

## Current Implementation

These documents describe features and systems currently active in the app:

### [Analytics](./analytics.md)
How the analytics system works, including:
- Data source (events table)
- Calculated metrics (streaks, totals, averages)
- Time period filtering
- Category breakdowns
- Database implementation via Supabase RPC

### [Points Economy](./points-economy.md)
The internal economy system:
- Ledger-based event tracking
- User wallet balances
- Point types (Appreciation, Favor, Wisdom, etc.)
- Event lifecycle and point transfers

### [Content Catalog](./content-catalog.md)
All predefined content in the app:
- Appreciation categories and badges
- Favor templates
- Wisdom messages
- Notification templates

### [Realtime Features](./realtime-features.md)
Supabase realtime implementation:
- Postgres Changes for message updates
- Current implementation details
- Channel subscription patterns

### [Implementation History](./implementation-history.md)
Step-by-step tracking of major features implemented:
- Timestamps and commit references
- Feature descriptions
- Implementation progression

## Completed Implementations

The [`completed/`](./completed/) folder contains documentation for features that have been fully implemented:
- **Tab Restructuring** - 6 to 5 tabs with More menu
- **Menu Restructuring** - Profile to More/Settings transformation
- **Design System** - Custom design tokens implementation
- **Invitation QR** - QR code partner connection

## Architecture

- **Frontend**: React Native with Expo Router
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State Management**: React Context (SessionProvider)
- **Navigation**: File-based routing with Expo Router
- **Design System**: Custom tokens in `utils/design-system.ts`

## Database Schema

Key tables:
- `users` - User profiles and relationships
- `events` - All user interactions (appreciations, favors, etc.)
- `wallets` - Aggregated point balances
- `templates` - Dynamic content templates

## Current Version

Version 0.2.4 (August 2025)
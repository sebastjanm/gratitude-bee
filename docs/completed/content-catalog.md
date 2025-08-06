# Gratitude Bee - Content Catalog

This document describes the content structure in Gratitude Bee. All content is stored in database tables and can be modified without changing the app code.

## Content Management

Content is managed through database tables:
- Initial content is loaded from `/supabase/seed.sql`
- Content can be updated directly in the database
- App fetches content dynamically on each use
- Admin users can modify templates via database

## Database Tables

### appreciation_templates
Stores all appreciation badges with:
- `id` - Unique identifier
- `category_id` - Category (support, kindness, humor, adventure, words)
- `title` - Badge name
- `description` - Badge description
- `points` - Points awarded
- `points_icon` - Icon for points (🐝, 🦋, 😊, ⛺, ❤️)
- `point_unit` - Unit name for points
- `icon` - Badge icon
- `notification_text` - Push notification message
- `is_active` - Enable/disable badge

### favor_templates
Stores favor request templates with:
- `id` - Unique identifier
- `category_id` - Category (food, errands, help, treats, etc.)
- `title` - Favor name
- `description` - Favor description
- `points` - Points cost
- `icon` - Favor icon
- `notification_text` - Push notification message
- `is_active` - Enable/disable favor

### Other Template Tables
- `hornet_templates` - Negative feedback templates
- `wisdom_templates` - Wisdom sharing templates
- `ping_templates` - Quick check-in templates
- `dont_panic_templates` - Calming message templates

## Default Content (from seed.sql)

### Appreciation Categories

| Category | Point Icon | Point Unit | Color |
|----------|------------|------------|-------|
| support | 🐝 | support | Teal |
| kindness | 🦋 | kindness | Pink |
| humor | 😊 | humor | Yellow |
| adventure | ⛺ | adventure | Orange |
| words | ❤️ | words | Red |

### Sample Badges

**Support Category:**
- Amazing Work (3 points)
- You Are The Best (5 points)
- I Believe In You (2 points)
- So Proud Of You (4 points)

**Kindness Category:**
- Thank You Very Much (1 point)
- Thanks For Coffee (2 points)
- Your Gentle Heart (3 points)
- Beautiful Caring Soul (4 points)

### Sample Favors

**Food Category:**
- Bring Me Coffee (5 points)
- Cook Dinner Tonight (15 points)

**Errands Category:**
- Go Grocery Shopping (12 points)
- Pick Me Up (8 points)

## Dynamic Loading

The app loads content dynamically:

```typescript
// AppreciationModal.tsx
const { data } = await supabase
  .from('appreciation_templates')
  .select('*');
```

Content is grouped by category in the UI but stored flat in the database.

## Modifying Content

To change content:
1. Update records in Supabase dashboard
2. Or run SQL queries to modify templates
3. Changes appear immediately in app
4. No app deployment needed

## Important Notes

- This document shows default content from seed.sql
- Actual content may differ if modified in production
- Check database for current content
- All users see the same templates (public read access)
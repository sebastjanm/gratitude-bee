# Category Filtering Implementation

## Date: 2025-01-08

## Components Modified

### 1. DontPanicModal.tsx
- Added `useCategories` hook import
- Added `selectedCategory` state variable initialized to 'all'
- Added `categoriesLoading` state from useCategories hook with type 'dontpanic'
- Modified template fetching query to include `category_id` field
- Added `filteredTemplates` computed variable that filters templates by selectedCategory
- Added `renderCategoryFilter` function that renders horizontal scrollable category buttons
- Added category filter UI between header and template list
- Reset selectedCategory to 'all' in handleClose function
- Added category icon mapping object for panic categories:
  - 'panic-call': Phone
  - 'panic-work': Briefcase
  - 'panic-anxiety': Clock
  - 'panic-health': Heart
  - 'panic-family': Users
- Added styles for category filter components

### 2. RelationshipWisdomModal.tsx
- Added `useCategories` hook import
- Added imports for icons: Heart, MessageCircle, Users, TreePine, Sparkles
- Added `category_id` field to WisdomOption interface
- Added `selectedCategory` state variable initialized to 'all'
- Added useCategories hook call with type 'wisdom'
- Modified template fetching query to include `category_id` field
- Added `filteredWisdomOptions` computed variable that filters templates by selectedCategory
- Added `renderCategoryFilter` function that renders horizontal scrollable category buttons
- Added category filter UI between header and wisdom section
- Reset selectedCategory to 'all' in handleClose function
- Added category icon mapping object for wisdom categories:
  - 'wisdom-love': Heart
  - 'wisdom-communication': MessageCircle
  - 'wisdom-conflict': Users
  - 'wisdom-growth': TreePine
- Added styles for category filter components

### 3. PingModal.tsx
- Added `useCategories` hook import
- Added imports for icons: Bell, Heart, Coffee, Home, Zap, Clock
- Added `category_id` field to PingTemplate interface
- Added `selectedCategory` state variable initialized to 'all'
- Added useCategories hook call with type 'ping'
- Modified template fetching query to include `category_id` field
- Added `filteredTemplates` computed variable that filters templates by selectedCategory
- Added `renderCategoryFilter` function that renders horizontal scrollable category buttons
- Added category filter UI between header and content section
- Reset selectedCategory to 'all' in handleClose function
- Added category icon mapping object for ping categories:
  - 'ping-checkin': Bell
  - 'ping-urgent': AlertTriangle
  - 'ping-worried': Heart
  - 'ping-thinking': Heart
  - 'ping-reminder': Clock
- Added styles for category filter components

### 4. FavorsModal.tsx
- Added `useCategories` hook import
- Added imports for icons: Gift, Heart, Coffee, Home, Car, Utensils
- Added `selectedCategory` state variable initialized to 'all'
- Added useCategories hook call with type 'favor'
- Added `filteredFavors` computed variable that filters templates by selectedCategory
- Added `renderCategoryFilter` function that renders horizontal scrollable category buttons
- Added category filter UI between header and favors grid
- Reset selectedCategory to 'all' in handleClose function
- Added category icon mapping object for favor categories:
  - 'favor-acts': Gift
  - 'favor-quality': Heart
  - 'favor-daily': Coffee
  - 'favor-home': Home
  - 'favor-errands': Car
  - 'favor-food': Utensils
- Added styles for category filter components

### 5. useCategories.ts
- Modified hook to accept optional `type` parameter
- Changed query to filter by `category_type` when type is provided
- Query now selects from 'categories' table with fields: id, name, icon_name, color, sort_order
- Orders results by sort_order

## Database Changes

### Migrations Created

#### 20250108_add_category_types_for_special_modals.sql
- Added `category_type` column to categories table (text type, nullable)
- Added `category_id` column to dont_panic_templates table (text type, nullable)
- Added `category_id` column to wisdom_templates table (text type, nullable)
- Added `category_id` column to ping_templates table (text type, nullable)

#### 20250108_add_favor_categories.sql
- Inserted favor categories with category_type 'favor'
- Inserted dontpanic categories with category_type 'dontpanic'
- Inserted wisdom categories with category_type 'wisdom'
- Inserted ping categories with category_type 'ping'

### SQL Scripts Created

#### add-missing-ping-templates.sql
- Created 5 templates for 'ping-thinking' category
- Created 7 templates for 'ping-reminder' category

## Category Filter UI Specifications

### Visual Design
- Horizontal scrollable container below modal header
- Category buttons: 88px width, 60px minimum height
- Rounded corners with BorderRadius.md
- Default state: backgroundElevated color with border
- Selected state: Primary/brand color background with white text
- Icons: 16px size, 2.5 stroke width when selected, 2 when not
- Snap scrolling with 88px intervals

### Behavior
- 'All' category always present as first option
- Selected category filters displayed templates
- Category selection persists until modal is closed
- Resets to 'all' when modal closes
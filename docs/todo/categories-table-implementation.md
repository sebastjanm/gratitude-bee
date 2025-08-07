# Categories Table Implementation Plan

**Status:** Not Implemented  
**Priority:** High  
**Complexity:** Medium

## Overview

Create a centralized `categories` table to replace hardcoded category metadata across the application. This will be the master table that all templates reference.

## Current State

### Hardcoded in Multiple Places:
1. **AppreciationModal.tsx** - Category metadata for sending
2. **rewards.tsx** - Category metadata for display
3. **Database** - Only stores category_id as text in templates

### Existing Categories:
- **Appreciation**: support, kindness, humor, adventure, words
- **Favors**: shopping, home_help, treats, food_drinks
- **Other**: hornet, dont-panic, ping, relationship-wisdom

## Database Design

```sql
-- Master categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  category_type TEXT NOT NULL CHECK (category_type IN ('appreciation', 'favor', 'special')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_categories_type ON categories(category_type);
CREATE INDEX idx_categories_active ON categories(is_active);
```

## Migration Plan

### Step 1: Create Table and Insert Data

```sql
-- Create the categories table
CREATE TABLE categories (...);

-- Insert all existing categories
INSERT INTO categories (id, name, icon_name, color, sort_order, category_type) VALUES
-- Appreciation categories
('support', 'Support', 'Star', '#4ECDC4', 1, 'appreciation'),
('kindness', 'Kindness', 'Heart', '#FF6B9D', 2, 'appreciation'),
('humor', 'Humor', 'Smile', '#FFD93D', 3, 'appreciation'),
('adventure', 'Adventure', 'Compass', '#6BCF7F', 4, 'appreciation'),
('words', 'Love Notes', 'MessageCircle', '#A8E6CF', 5, 'appreciation'),
-- Favor categories
('shopping', 'Errands & Shopping', 'ShoppingCart', '#3498db', 6, 'favor'),
('home_help', 'Home Help', 'Home', '#e74c3c', 7, 'favor'),
('treats', 'Treats', 'Gift', '#f39c12', 8, 'favor'),
('food_drinks', 'Food & Drinks', 'Coffee', '#27ae60', 9, 'favor'),
-- Special categories
('hornet', 'Hornets', 'Bug', '#FF4444', 10, 'special'),
('dont-panic', "Don't Panic", 'Heart', '#6366F1', 11, 'special'),
('ping', 'Pings', 'Bell', '#3B82F6', 12, 'special'),
('relationship-wisdom', 'Relationship Wisdom', 'Crown', '#9B59B6', 13, 'special');
```

### Step 2: Add Foreign Key Constraints

```sql
-- Add foreign keys to existing tables
ALTER TABLE appreciation_templates 
  ADD CONSTRAINT fk_appreciation_category 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id);

ALTER TABLE favor_templates 
  ADD CONSTRAINT fk_favor_category 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id);

ALTER TABLE hornet_templates 
  ADD CONSTRAINT fk_hornet_category 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id);

ALTER TABLE ping_templates 
  ADD CONSTRAINT fk_ping_category 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id);

ALTER TABLE dont_panic_templates 
  ADD CONSTRAINT fk_dont_panic_category 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id);

ALTER TABLE relationship_wisdom_templates 
  ADD CONSTRAINT fk_wisdom_category 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id);
```

### Step 3: Create RLS Policies

```sql
-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Read access for all authenticated users
CREATE POLICY "Users can view categories"
  ON categories FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admin-only write access
CREATE POLICY "Only admins can modify categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );
```

## Frontend Updates

### 1. AppreciationModal.tsx

**Before:**
```typescript
const categoryMap: { [key: string]: SubCategory } = {
  support: { id: 'support', name: 'Support', icon: Star, color: '#4ECDC4', badges: [] },
  // ... hardcoded
};
```

**After:**
```typescript
const fetchCategories = async () => {
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('category_type', 'appreciation')
    .eq('is_active', true)
    .order('sort_order');
    
  // Map icon names to components
  const iconMap = {
    'Star': Star,
    'Heart': Heart,
    'Smile': Smile,
    // ...
  };
  
  return categories.map(cat => ({
    ...cat,
    icon: iconMap[cat.icon_name] || Star,
    badges: []
  }));
};
```

### 2. rewards.tsx

Similar update - fetch categories from database instead of hardcoding.

### 3. Create Categories Hook

```typescript
// hooks/useCategories.ts
export const useCategories = (type?: string) => {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      const query = supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);
        
      if (type) {
        query.eq('category_type', type);
      }
      
      const { data, error } = await query.order('sort_order');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};
```

## Benefits

1. **Single Source of Truth** - All category info in one place
2. **Dynamic Management** - Add/edit categories without code changes
3. **Consistency** - Same colors/icons everywhere
4. **Future-Proof** - Easy to add new category types
5. **Admin Control** - Can disable categories without removing data
6. **Referential Integrity** - Can't have templates with invalid categories

## Rollback Plan

If issues arise:
1. Remove foreign key constraints first
2. Keep categories table but don't use it
3. Revert frontend to hardcoded values
4. Fix issues then retry

## Testing Checklist

- [ ] All existing templates still work
- [ ] AppreciationModal shows all categories
- [ ] Rewards page displays correctly
- [ ] Can create new templates with existing categories
- [ ] Foreign key constraints prevent invalid data
- [ ] Performance is acceptable
- [ ] RLS policies work correctly

## Future Enhancements

1. **Category Icons** - Store actual icon files/SVGs
2. **Translations** - Multi-language category names
3. **Custom Categories** - Per-couple custom categories
4. **Category Stats** - Track usage per category
5. **Category Images** - Visual representations
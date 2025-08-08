-- Add favor categories to match the templates
INSERT INTO public.categories (id, name, icon_name, color, sort_order, category_type, is_active, description, tagline) 
VALUES
  ('food', 'Food & Drinks', 'Coffee', '#8B4513', 1, 'favor', true, 'Meals, snacks, and beverages', 'Culinary delights'),
  ('errands', 'Errands', 'ShoppingCart', '#4ECDC4', 2, 'favor', true, 'Help with errands and shopping trips', 'Running errands'),
  ('help', 'Home Help', 'Home', '#FFEAA7', 3, 'favor', true, 'Assistance around the house', 'Household tasks'),
  ('treats', 'Treats', 'Gift', '#FF69B4', 4, 'favor', true, 'Special surprises and gifts', 'Special surprises'),
  ('affection', 'Affection', 'Heart', '#FF6B9D', 5, 'favor', true, 'Physical comfort and care', 'Show you care'),
  ('pets', 'Pet Care', 'Heart', '#10B981', 6, 'favor', true, 'Help with pet responsibilities', 'Pet duties'),
  ('chores', 'Chores', 'CheckSquare', '#9B59B6', 7, 'favor', true, 'Daily household tasks', 'Get things done')
ON CONFLICT (id) DO UPDATE SET
  category_type = EXCLUDED.category_type,
  name = EXCLUDED.name,
  icon_name = EXCLUDED.icon_name,
  color = EXCLUDED.color,
  description = EXCLUDED.description,
  tagline = EXCLUDED.tagline;

-- Ensure all favor templates have valid categories
UPDATE public.favor_templates 
SET is_active = true 
WHERE category_id IN ('food', 'errands', 'help', 'treats', 'affection', 'pets', 'chores');
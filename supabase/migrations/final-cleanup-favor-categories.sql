-- Deactivate the duplicate 'shopping' category since we're using 'errands'
UPDATE public.categories 
SET is_active = false 
WHERE id = 'shopping' AND category_type = 'favor';

-- Also deactivate any other duplicate categories if they exist
UPDATE public.categories 
SET is_active = false 
WHERE id IN ('food_drinks', 'home_help') AND category_type = 'favor';

-- Fix sort order to avoid duplicates (pets and shopping both had sort_order 6)
UPDATE public.categories 
SET sort_order = CASE id
  WHEN 'food' THEN 1
  WHEN 'errands' THEN 2  
  WHEN 'help' THEN 3
  WHEN 'treats' THEN 4
  WHEN 'affection' THEN 5
  WHEN 'pets' THEN 6
  WHEN 'chores' THEN 7
  ELSE sort_order
END
WHERE category_type = 'favor' AND is_active = true;
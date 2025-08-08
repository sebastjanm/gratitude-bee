-- Delete duplicate favor categories
DELETE FROM public.categories 
WHERE id IN ('shopping', 'food_drinks', 'home_help') 
AND category_type = 'favor';

-- Fix sort order for remaining categories
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
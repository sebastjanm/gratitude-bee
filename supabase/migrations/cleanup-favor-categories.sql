-- Deactivate duplicate favor categories (keeping the ones that match your templates)
UPDATE public.categories 
SET is_active = false 
WHERE id IN ('food_drinks', 'home_help', 'shopping') 
AND category_type = 'favor';

-- Also update the 'treats' category to have the correct sort order
UPDATE public.categories 
SET sort_order = 4
WHERE id = 'treats' AND category_type = 'favor';

-- Make sure all the correct categories are active and have proper sort order
UPDATE public.categories 
SET is_active = true, sort_order = CASE id
  WHEN 'food' THEN 1
  WHEN 'errands' THEN 2  
  WHEN 'help' THEN 3
  WHEN 'treats' THEN 4
  WHEN 'affection' THEN 5
  WHEN 'pets' THEN 6
  WHEN 'chores' THEN 7
  ELSE sort_order
END
WHERE id IN ('food', 'errands', 'help', 'treats', 'affection', 'pets', 'chores')
AND category_type = 'favor';
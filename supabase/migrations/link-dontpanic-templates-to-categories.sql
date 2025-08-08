-- Link Don't Panic templates to appropriate categories based on their content

-- Generic calming messages go to panic-anxiety
UPDATE public.dont_panic_templates 
SET category_id = 'panic-anxiety'
WHERE id IN ('calm-energy', 'everything-okay', 'youre-safe')
AND (category_id IS NULL OR category_id = '');

-- Support/communication messages go to panic-family (family/relationship stress)
UPDATE public.dont_panic_templates 
SET category_id = 'panic-family'
WHERE id IN ('here-for-you', 'talk-when-ready')
AND (category_id IS NULL OR category_id = '');

-- If you have more templates, categorize them appropriately
-- For example:
-- UPDATE public.dont_panic_templates 
-- SET category_id = 'panic-call'
-- WHERE title ILIKE '%call%' OR description ILIKE '%phone%';

-- UPDATE public.dont_panic_templates 
-- SET category_id = 'panic-work'
-- WHERE title ILIKE '%work%' OR title ILIKE '%job%' OR description ILIKE '%boss%';

-- UPDATE public.dont_panic_templates 
-- SET category_id = 'panic-health'
-- WHERE title ILIKE '%health%' OR description ILIKE '%doctor%' OR description ILIKE '%medical%';

-- Verify all templates now have categories
SELECT id, title, category_id FROM dont_panic_templates ORDER BY category_id, id;
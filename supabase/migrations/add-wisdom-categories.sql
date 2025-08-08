-- Add wisdom categories (already exist from earlier migration, but let's ensure they're correct)
INSERT INTO public.categories (id, name, icon_name, color, sort_order, category_type, is_active, description, tagline) 
VALUES
  ('wisdom-apology', 'Apologies', 'Heart', '#EF4444', 1, 'wisdom', true, 'Ways to say sorry and make amends', 'Make it right'),
  ('wisdom-appreciation', 'Appreciation', 'Star', '#10B981', 2, 'wisdom', true, 'Express gratitude and love', 'Show you care'),
  ('wisdom-connection', 'Connection', 'MessageCircle', '#3B82F6', 3, 'wisdom', true, 'Strengthen your bond', 'Stay close')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon_name = EXCLUDED.icon_name,
  color = EXCLUDED.color,
  description = EXCLUDED.description,
  tagline = EXCLUDED.tagline,
  is_active = true;

-- Add category_id column to wisdom_templates if it doesn't exist
ALTER TABLE public.wisdom_templates 
ADD COLUMN IF NOT EXISTS category_id text REFERENCES public.categories(id);

-- Link wisdom templates to categories
UPDATE public.wisdom_templates 
SET category_id = CASE
  -- Apology templates
  WHEN id IN ('im-sorry-lady', 'im-sorry-man', 'truly-sorry', 'deeply-regret', 'unacceptable-behavior', 
              'oops-brain-break', 'foot-in-mouth', 'dingus-apology') THEN 'wisdom-apology'
  -- Appreciation templates  
  WHEN id IN ('incredibly-grateful', 'my-rock', 'your-happiness', 'you-are-awesome', 
              'thinking-of-you', 'make-my-world-better', 'yes-dear', 'happy-wife-happy-life', 
              'happy-husband-happy-life') THEN 'wisdom-appreciation'
  -- Connection templates
  WHEN id IN ('time-for-us', 'brighter-day', 'remember-that-time') THEN 'wisdom-connection'
  ELSE category_id
END
WHERE category_id IS NULL OR category_id = '';

-- Verify the distribution
SELECT c.name as category, COUNT(w.id) as template_count 
FROM categories c
LEFT JOIN wisdom_templates w ON w.category_id = c.id
WHERE c.category_type = 'wisdom'
GROUP BY c.id, c.name
ORDER BY c.sort_order;
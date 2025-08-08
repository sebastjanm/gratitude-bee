-- Add new category types for all special modals to enable consistent filtering
-- This migration enables Don't Panic, Wisdom, Ping, and Hornet modals to use categories

-- Step 1: Update the categories constraint to include new category types
ALTER TABLE public.categories 
DROP CONSTRAINT IF EXISTS categories_category_type_check;

ALTER TABLE public.categories 
ADD CONSTRAINT categories_category_type_check 
CHECK (category_type = ANY (ARRAY[
  'appreciation'::text,
  'favor'::text,
  'special'::text,
  'dontpanic'::text,
  'wisdom'::text,
  'ping'::text,
  'hornet'::text
]));

-- Step 2: Add category_id column to all special template tables
ALTER TABLE public.dont_panic_templates 
ADD COLUMN IF NOT EXISTS category_id text REFERENCES public.categories(id);

ALTER TABLE public.wisdom_templates 
ADD COLUMN IF NOT EXISTS category_id text REFERENCES public.categories(id);

ALTER TABLE public.ping_templates 
ADD COLUMN IF NOT EXISTS category_id text REFERENCES public.categories(id);

ALTER TABLE public.hornet_templates 
ADD COLUMN IF NOT EXISTS category_id text REFERENCES public.categories(id);

-- Step 3: Insert categories for Don't Panic
INSERT INTO public.categories (id, name, icon_name, color, sort_order, category_type, is_active, description, tagline) 
VALUES
  ('panic-call', 'Stressful Call', 'Phone', '#EF4444', 1, 'dontpanic', true, 'When calls become overwhelming', 'Take a breath'),
  ('panic-work', 'Job Situation', 'Briefcase', '#8B5CF6', 2, 'dontpanic', true, 'Work-related stress and pressure', 'You got this'),
  ('panic-anxiety', 'Anxiety Moment', 'Clock', '#F59E0B', 3, 'dontpanic', true, 'When anxiety kicks in', 'Stay grounded'),
  ('panic-health', 'Health Worry', 'Heart', '#EC4899', 4, 'dontpanic', true, 'Health concerns and scares', 'Breathe deeply'),
  ('panic-family', 'Family Stress', 'Users', '#10B981', 5, 'dontpanic', true, 'Family-related tensions', 'One step at a time')
ON CONFLICT (id) DO NOTHING;

-- Step 4: Insert categories for Relationship Wisdom
INSERT INTO public.categories (id, name, icon_name, color, sort_order, category_type, is_active, description, tagline) 
VALUES
  ('wisdom-love', 'Love & Romance', 'Heart', '#FF6B9D', 1, 'wisdom', true, 'Insights about love and connection', 'Love wisely'),
  ('wisdom-conflict', 'Conflict Resolution', 'MessageSquare', '#4ECDC4', 2, 'wisdom', true, 'Navigate disagreements gracefully', 'Find peace'),
  ('wisdom-growth', 'Personal Growth', 'TrendingUp', '#9B59B6', 3, 'wisdom', true, 'Grow stronger together', 'Keep learning'),
  ('wisdom-communication', 'Communication', 'MessageCircle', '#3B82F6', 4, 'wisdom', true, 'Better ways to connect', 'Listen deeply'),
  ('wisdom-trust', 'Trust & Respect', 'Shield', '#10B981', 5, 'wisdom', true, 'Building trust and respect', 'Honor each other')
ON CONFLICT (id) DO NOTHING;

-- Step 5: Insert categories for Pings
INSERT INTO public.categories (id, name, icon_name, color, sort_order, category_type, is_active, description, tagline) 
VALUES
  ('ping-checkin', 'Check-in', 'Bell', '#3B82F6', 1, 'ping', true, 'Quick hello to stay connected', 'Stay close'),
  ('ping-urgent', 'Urgent', 'AlertTriangle', '#EF4444', 2, 'ping', true, 'Need immediate response', 'Please respond'),
  ('ping-worried', 'Worried', 'Heart', '#F59E0B', 3, 'ping', true, 'Concerned about you', 'Are you okay?'),
  ('ping-thinking', 'Thinking of You', 'Heart', '#EC4899', 4, 'ping', true, 'Let them know they matter', 'You matter'),
  ('ping-reminder', 'Reminder', 'Clock', '#10B981', 5, 'ping', true, 'Don''t forget something important', 'Remember this')
ON CONFLICT (id) DO NOTHING;

-- Step 6: Insert categories for Hornets (Difficult Conversations)
INSERT INTO public.categories (id, name, icon_name, color, sort_order, category_type, is_active, description, tagline) 
VALUES
  ('hornet-behavior', 'Behavior Issue', 'AlertCircle', '#EF4444', 1, 'hornet', true, 'Address concerning behaviors', 'Handle with care'),
  ('hornet-boundary', 'Boundary Crossed', 'Shield', '#F59E0B', 2, 'hornet', true, 'When limits need to be set', 'Respect needed'),
  ('hornet-communication', 'Communication Problem', 'MessageSquare', '#8B5CF6', 3, 'hornet', true, 'Fix communication breakdowns', 'Clear the air'),
  ('hornet-expectation', 'Unmet Expectations', 'Target', '#EC4899', 4, 'hornet', true, 'Address disappointments', 'Align expectations'),
  ('hornet-hurt', 'Feeling Hurt', 'Heart', '#64748B', 5, 'hornet', true, 'Express emotional pain', 'Heal together')
ON CONFLICT (id) DO NOTHING;

-- Step 7: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dont_panic_templates_category 
ON public.dont_panic_templates(category_id);

CREATE INDEX IF NOT EXISTS idx_wisdom_templates_category 
ON public.wisdom_templates(category_id);

CREATE INDEX IF NOT EXISTS idx_ping_templates_category 
ON public.ping_templates(category_id);

CREATE INDEX IF NOT EXISTS idx_hornet_templates_category 
ON public.hornet_templates(category_id);

-- Step 8: Update existing templates with appropriate categories (examples)
-- You'll need to manually review and assign categories to existing templates
-- Here are some example updates:

-- Example for Don't Panic templates
UPDATE public.dont_panic_templates 
SET category_id = 'panic-call' 
WHERE title ILIKE '%call%' OR title ILIKE '%phone%';

UPDATE public.dont_panic_templates 
SET category_id = 'panic-work' 
WHERE title ILIKE '%work%' OR title ILIKE '%job%' OR title ILIKE '%boss%';

UPDATE public.dont_panic_templates 
SET category_id = 'panic-anxiety' 
WHERE title ILIKE '%anxiety%' OR title ILIKE '%panic%' OR title ILIKE '%worried%';

-- Example for Wisdom templates (based on actual data)
UPDATE public.wisdom_templates 
SET category_id = 'wisdom-love' 
WHERE id IN ('incredibly-grateful', 'make-my-world-better', 'my-rock', 'your-happiness', 'you-are-awesome');

UPDATE public.wisdom_templates 
SET category_id = 'wisdom-conflict' 
WHERE id IN ('im-sorry-lady', 'im-sorry-man', 'truly-sorry', 'deeply-regret', 'unacceptable-behavior', 'foot-in-mouth', 'oops-brain-break');

UPDATE public.wisdom_templates 
SET category_id = 'wisdom-growth' 
WHERE id IN ('brighter-day', 'remember-that-time', 'time-for-us');

UPDATE public.wisdom_templates 
SET category_id = 'wisdom-communication' 
WHERE id IN ('happy-wife-happy-life', 'happy-husband-happy-life', 'yes-dear');

-- Example for Ping templates (based on actual data)
UPDATE public.ping_templates 
SET category_id = 'ping-checkin' 
WHERE id IN ('checking-in', 'pingic-a');

UPDATE public.ping_templates 
SET category_id = 'ping-urgent' 
WHERE id IN ('urgent', 'hornet-alert');

UPDATE public.ping_templates 
SET category_id = 'ping-worried' 
WHERE id IN ('worried');

-- Example for Hornet templates (based on actual data)
UPDATE public.hornet_templates 
SET category_id = 'hornet-behavior' 
WHERE id IN ('not-ok');

UPDATE public.hornet_templates 
SET category_id = 'hornet-communication' 
WHERE id IN ('light-misunderstanding', 'clusterfuck');

-- Add comments for documentation
COMMENT ON COLUMN public.dont_panic_templates.category_id IS 'Links template to a category for filtering';
COMMENT ON COLUMN public.wisdom_templates.category_id IS 'Links template to a category for filtering';
COMMENT ON COLUMN public.ping_templates.category_id IS 'Links template to a category for filtering';
COMMENT ON COLUMN public.hornet_templates.category_id IS 'Links template to a category for filtering';
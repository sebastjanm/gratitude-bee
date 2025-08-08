-- Add description and tagline fields to categories table for better UX
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Update appreciation categories with meaningful descriptions
UPDATE public.categories SET
  description = CASE id
    WHEN 'support' THEN 'When they''ve been there for you'
    WHEN 'kindness' THEN 'Recognize acts of caring and compassion'
    WHEN 'humor' THEN 'Celebrate laughter and good times'
    WHEN 'adventure' THEN 'For shared experiences and exploration'
    WHEN 'words' THEN 'Express your feelings through words'
    ELSE description
  END,
  tagline = CASE id
    WHEN 'support' THEN 'Show gratitude'
    WHEN 'kindness' THEN 'Share your heart'
    WHEN 'humor' THEN 'Keep it light'
    WHEN 'adventure' THEN 'Discover together'
    WHEN 'words' THEN 'Say what matters'
    ELSE tagline
  END
WHERE category_type = 'appreciation';

-- Update favor categories
UPDATE public.categories SET
  description = CASE id
    WHEN 'shopping' THEN 'Help with errands and shopping trips'
    WHEN 'home_help' THEN 'Assistance around the house'
    WHEN 'treats' THEN 'Special surprises and gifts'
    WHEN 'food_drinks' THEN 'Meals, snacks, and beverages'
    ELSE description
  END,
  tagline = CASE id
    WHEN 'shopping' THEN 'Running errands'
    WHEN 'home_help' THEN 'Household tasks'
    WHEN 'treats' THEN 'Special surprises'
    WHEN 'food_drinks' THEN 'Culinary delights'
    ELSE tagline
  END
WHERE category_type = 'favor';

-- Update special categories
UPDATE public.categories SET
  description = CASE id
    WHEN 'hornet' THEN 'Address relationship challenges'
    WHEN 'dont-panic' THEN 'Emergency support and reassurance'
    WHEN 'ping' THEN 'Quick check-ins and reminders'
    WHEN 'relationship-wisdom' THEN 'Share insights and advice'
    ELSE description
  END,
  tagline = CASE id
    WHEN 'hornet' THEN 'Handle with care'
    WHEN 'dont-panic' THEN 'Stay calm'
    WHEN 'ping' THEN 'Quick touch'
    WHEN 'relationship-wisdom' THEN 'Share wisdom'
    ELSE tagline
  END
WHERE category_type = 'special';
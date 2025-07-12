-- Gratitude Bee - Database Seed Script
-- Version: 1.2
--
-- This script populates the template tables with the initial
-- content for the application. Run this script in the Supabase SQL Editor
-- after running the initial schema migration.
--
-- Changes:
-- - Made script idempotent by deleting existing data before insertion.

-- =================================================================
-- 0. CLEAR EXISTING TEMPLATE DATA
-- =================================================================
DELETE FROM public.appreciation_templates;
DELETE FROM public.favor_templates;
DELETE FROM public.hornet_templates;

-- =================================================================
-- 1. APPRECIATION TEMPLATES
-- =================================================================

-- Support Badges
INSERT INTO public.appreciation_templates (id, category_id, title, description, points, points_icon, notification_text, icon, point_unit) VALUES
('amazing-work', 'support', 'Amazing Work', 'Recognizing exceptional effort and dedication', 3, '🐝', 'sent you an ''Amazing Work'' badge!', '🏆', 'support'),
('you-are-best', 'support', 'You Are The Best', 'Ultimate appreciation for being incredible', 5, '🐝', 'thinks you are the best!', '🌟', 'support'),
('believe-in-you', 'support', 'I Believe In You', 'Encouraging during challenging times', 2, '🐝', 'wants you to know they believe in you!', '💪', 'support'),
('proud-of-you', 'support', 'So Proud Of You', 'Celebrating achievements and milestones', 4, '🐝', 'is so proud of you!', '🎉', 'support');

-- Kindness Badges
INSERT INTO public.appreciation_templates (id, category_id, title, description, points, points_icon, notification_text, icon, point_unit) VALUES
('thank-you-much', 'kindness', 'Thank You Very Much', 'Deep gratitude for thoughtful actions', 1, '🦋', 'is very thankful for you!', '🙏', 'kindness'),
('thanks-coffee', 'kindness', 'Thanks For Coffee', 'Appreciating morning thoughtfulness', 2, '🦋', 'is thankful for the coffee!', '☕', 'kindness'),
('gentle-heart', 'kindness', 'Your Gentle Heart', 'Recognizing natural compassion', 3, '🦋', 'appreciates your gentle heart.', '💖', 'kindness'),
('caring-soul', 'kindness', 'Beautiful Caring Soul', 'Honoring deep empathy and care', 4, '🦋', 'thinks you have a beautiful, caring soul.', '❤️', 'kindness');

-- Humor Badges
INSERT INTO public.appreciation_templates (id, category_id, title, description, points, points_icon, notification_text, icon, point_unit) VALUES
('lol', 'humor', 'LOL', 'Simple moment of laughter', 1, '😊', 'thought that was hilarious!', '😂', 'humor'),
('rofl', 'humor', 'ROFL', 'Rolling on the floor laughing', 3, '😊', 'is rolling on the floor laughing!', '🤣', 'humor'),
('made-me-laugh', 'humor', 'Made Me Laugh', 'Bringing joy with perfect timing', 2, '😊', 'is still laughing about that.', '😄', 'humor'),
('silly-dance', 'humor', 'Silly Dance Master', 'Spontaneous moments of pure fun', 3, '😊', 'loved your silly dance!', '💃', 'humor'),
('comedy-genius', 'humor', 'Comedy Genius', 'Natural talent for making others smile', 4, '😊', 'thinks you''re a comedy genius.', '🤡', 'humor'),
('brightened-day', 'humor', 'Brightened My Day', 'Turning ordinary moments into joy', 3, '😊', 'wanted to say you brightened their day.', '😊', 'humor');

-- Adventure Badges
INSERT INTO public.appreciation_templates (id, category_id, title, description, points, points_icon, notification_text, icon, point_unit) VALUES
('sunset-walk', 'adventure', 'Perfect Sunset Walk', 'Creating magical shared moments', 3, '⛺', 'loved that sunset walk with you.', '🌅', 'adventure'),
('new-place', 'adventure', 'Found New Place', 'Discovering hidden gems together', 4, '⛺', 'is excited about the new place you found.', '🗺️', 'adventure'),
('spontaneous-trip', 'adventure', 'Spontaneous Adventure', 'Embracing unexpected journeys', 5, '⛺', 'is still thinking about your spontaneous adventure.', '🚀', 'adventure'),
('nature-lover', 'adventure', 'Nature Connection', 'Sharing love for the outdoors', 2, '⛺', 'appreciates your connection with nature.', '🌿', 'adventure');

-- Love Notes Badges
INSERT INTO public.appreciation_templates (id, category_id, title, description, points, points_icon, notification_text, icon, point_unit) VALUES
('you-are-everything', 'words', 'You Are My Everything', 'Complete devotion and love', 3, '❤️', 'wants you to know you''re their everything.', '💞', 'words'),
('thinking-of-you', 'words', 'Thinking Of You', 'Constant presence in thoughts', 1, '❤️', 'is thinking of you.', '💭', 'words'),
('sweet-message', 'words', 'Sweet Message', 'Perfect words at the right time', 2, '❤️', 'loved your sweet message.', '💌', 'words'),
('morning-text', 'words', 'Beautiful Morning Text', 'Starting the day with love', 3, '❤️', 'is smiling because of your morning text.', '☀️', 'words'),
('love-letter', 'words', 'Heartfelt Love Letter', 'Deep emotional expression', 5, '❤️', 'is touched by your heartfelt letter.', '📜', 'words'),
('encouraging-words', 'words', 'Encouraging Words', 'Lifting spirits with kindness', 3, '❤️', 'is grateful for your encouraging words.', '🤗', 'words');


-- =================================================================
-- 2. FAVOR TEMPLATES
-- =================================================================

-- Food & Drinks
INSERT INTO public.favor_templates (id, category_id, title, description, points, icon) VALUES
('bring-coffee', 'food', 'Bring Me Coffee', 'A perfect cup of coffee, just the way I like it', 5, '☕'),
('cook-dinner', 'food', 'Cook Dinner Tonight', 'Surprise me with a delicious home-cooked meal', 15, '🧑‍🍳'),
('order-food', 'food', 'Order My Favorite Food', 'I''m craving something special, please order it', 10, '🥡');

-- Errands & Shopping
INSERT INTO public.favor_templates (id, category_id, title, description, points, icon) VALUES
('grocery-shopping', 'errands', 'Go Grocery Shopping', 'Pick up groceries from our shopping list', 12, '🛒'),
('pick-me-up', 'errands', 'Pick Me Up', 'Come get me from this location', 8, '🚗'),
('run-errand', 'errands', 'Run a Quick Errand', 'Help me with a small task or errand', 7, '🏃‍♂️');

-- Home Help
INSERT INTO public.favor_templates (id, category_id, title, description, points, icon) VALUES
('clean-kitchen', 'help', 'Clean the Kitchen', 'Take care of the dishes and tidy up', 10, '🧼'),
('help-with-chores', 'help', 'Help with Chores', 'Lend a hand with household tasks', 8, '🧹');

-- Treats & Special
INSERT INTO public.favor_templates (id, category_id, title, description, points, icon) VALUES
('ice-cream', 'treats', 'Bring Me Ice Cream', 'I need something sweet and cold', 6, '🍦'),
('surprise-treat', 'treats', 'Surprise Me with a Treat', 'Something special to brighten my day', 12, '🎁');

-- Seed data for favor_templates
INSERT INTO "public"."favor_templates" ("id", "category_id", "title", "description", "points", "icon", "is_active", "points_icon", "notification_text") VALUES
('bring-coffee', 'food', 'Can you make a coffee?', 'A perfect cup of coffee, maybe some milk', '5', '☕', 'true', '🌟', 'is asking if you could make them a coffee.'),
('cook-dinner', 'food', 'Cook Dinner Tonight', 'A delicious, home-cooked meal', '15', '🍳', 'true', '🌟', 'would love it if you could cook dinner tonight.'),
('walk-dog', 'chores', 'Walk the Dog', 'A nice long walk for our furry friend', '10', '🐕', 'true', '🌟', 'is asking for a hand with walking the dog.'),
('back-rub', 'affection', 'Quick Back Rub', 'A 5-minute back rub to de-stress', '5', '💆', 'true', '🌟', 'would really appreciate a quick back rub.')
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active,
  points_icon = EXCLUDED.points_icon,
  notification_text = EXCLUDED.notification_text;


-- =================================================================
-- 3. HORNET TEMPLATES
-- =================================================================

INSERT INTO public.hornet_templates (id, title, description, severity, points, icon) VALUES
('light-misunderstanding', 'Light Misunderstanding', 'Minor issue that needs gentle addressing', 'light', -10, '🤔'),
('not-ok', 'Hey, This Is Not OK', 'Significant concern that requires attention', 'medium', -50, '😠'),
('clusterfuck', 'Clusterfuck', 'Major issue requiring serious discussion', 'heavy', -100, '💣'); 
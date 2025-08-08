-- Add missing ping templates for ping-thinking and ping-reminder categories

-- Templates for 'ping-thinking' category
INSERT INTO "public"."ping_templates" ("id", "title", "description", "icon", "color", "points", "points_icon", "point_unit", "notification_text", "is_active", "created_at", "category_id") VALUES 
('thinking-of-you', 'Thinking of you', 'Just wanted you to know you''re on my mind.', '💭', '#EC4899', '1', '🏓', 'ping', 'Someone is thinking of you right now.', 'true', NOW(), 'ping-thinking'),
('miss-you', 'I miss you', 'Missing you and can''t wait to see you again.', '💕', '#EC4899', '2', '🏓🏓', 'ping', 'Your partner misses you!', 'true', NOW(), 'ping-thinking'),
('love-you-random', 'Random I love you', 'No reason needed - just wanted to say I love you!', '❤️', '#EC4899', '1', '🏓', 'ping', 'You just received a random I love you!', 'true', NOW(), 'ping-thinking'),
('cant-stop-thinking', 'Can''t stop thinking about you', 'You''ve been on my mind all day.', '🥰', '#EC4899', '2', '🏓🏓', 'ping', 'Someone can''t stop thinking about you!', 'true', NOW(), 'ping-thinking'),
('sending-hugs', 'Sending virtual hugs', 'Consider yourself hugged from afar!', '🤗', '#EC4899', '1', '🏓', 'ping', 'Virtual hugs incoming!', 'true', NOW(), 'ping-thinking');

-- Templates for 'ping-reminder' category
INSERT INTO "public"."ping_templates" ("id", "title", "description", "icon", "color", "points", "points_icon", "point_unit", "notification_text", "is_active", "created_at", "category_id") VALUES 
('dont-forget', 'Don''t forget!', 'Friendly reminder about that thing we discussed.', '📝', '#10B981', '1', '🏓', 'ping', 'You have a reminder from your partner.', 'true', NOW(), 'ping-reminder'),
('appointment-reminder', 'Appointment today', 'Remember you have that appointment today!', '📅', '#10B981', '2', '🏓🏓', 'ping', 'Appointment reminder from your partner!', 'true', NOW(), 'ping-reminder'),
('take-meds', 'Medication reminder', 'Time to take your medication!', '💊', '#10B981', '1', '🏓', 'ping', 'Medication reminder!', 'true', NOW(), 'ping-reminder'),
('drink-water', 'Hydration check', 'Have you had enough water today?', '💧', '#10B981', '1', '🏓', 'ping', 'Hydration reminder from someone who cares!', 'true', NOW(), 'ping-reminder'),
('eat-something', 'Did you eat?', 'Just checking if you''ve had something to eat today.', '🍽️', '#10B981', '1', '🏓', 'ping', 'Someone wants to make sure you''ve eaten!', 'true', NOW(), 'ping-reminder'),
('leaving-work', 'Time to leave work', 'Don''t work too late - time to come home!', '🏠', '#10B981', '2', '🏓🏓', 'ping', 'Your partner says it''s time to leave work!', 'true', NOW(), 'ping-reminder'),
('important-task', 'Important task reminder', 'Remember to do that important thing today!', '⭐', '#10B981', '2', '🏓🏓', 'ping', 'Important task reminder from your partner!', 'true', NOW(), 'ping-reminder');
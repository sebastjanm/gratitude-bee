-- Create the wisdom_templates table
CREATE TABLE "public"."wisdom_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "points" INTEGER DEFAULT 1,
    "points_icon" TEXT DEFAULT '🧠',
    "point_unit" TEXT DEFAULT 'wisdom',
    "notification_text" TEXT,
    "is_active" BOOLEAN DEFAULT TRUE NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add comments to the table and columns
COMMENT ON TABLE "public"."wisdom_templates" IS 'Templates for pre-defined wisdom messages.';

-- Enable RLS
ALTER TABLE "public"."wisdom_templates" ENABLE ROW LEVEL SECURITY;

-- Create policy for reading templates
CREATE POLICY "Allow read access to all authenticated users" ON "public"."wisdom_templates"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- Seed the wisdom templates data
INSERT INTO "public"."wisdom_templates" ("id", "title", "description", "icon", "color", "points", "points_icon", "point_unit", "notification_text") VALUES
('yes-dear', 'Yes, dear', 'I gracefully accept your perspective and wisdom. I will do as you say.', '👑', '#E67E22', 1, '🧠', 'wisdom', 'You''ve received some wisdom: Yes, dear'),
('happy-wife-happy-life', 'Happy wife, happy life', 'I understand your priorities and harmony', '🏠', '#27AE60', 1, '🧠', 'wisdom', 'You''ve received some wisdom: Happy wife, happy life'),
('happy-husband-happy-life', 'Happy man, happy life', 'I understand your priorities and harmony', '👨', '#27AE60', 1, '🧠', 'wisdom', 'You''ve received some wisdom: Happy man, happy life'),
('im-sorry-lady', 'I''m Sorry - ladies only :)', 'Im aplogizing but in no way am I admitting to anything', '💔', '#F87171', 2, '🧠', 'wisdom', 'You''ve received an apology!'),
('im-sorry-man', 'I''m Sorry - man only :)', 'Sincere apology and commitment to making amends. Im guilty as charged.', '💔', '#F87171', 2, '🧠', 'wisdom', 'You''ve received an apology!'),
('truly-sorry', 'I''m truly sorry', 'I''m truly sorry for my actions. I was wrong, and I''m committed to making things right. Please forgive me.', '🙏', '#E74C3C', 3, '🧠', 'wisdom', 'A sincere apology has been sent.'),
('deeply-regret', 'I deeply regret it', 'I deeply regret what I said/did. It was thoughtless, and you didn''t deserve it. I''ll work on being more mindful.', '😔', '#E74C3C', 3, '🧠', 'wisdom', 'A heartfelt apology is on its way.'),
('unacceptable-behavior', 'My behavior was unacceptable', 'My behavior was unacceptable, and I take full responsibility. I value our relationship too much to let my mistake come between us.', '🙇‍♂️', '#E74C3C', 4, '🧠', 'wisdom', 'An apology acknowledging unacceptable behavior has been sent.'),
('oops-brain-break', 'Oops!', 'Oops! My brain must have been on a coffee break. Forgive my temporary lapse in genius?', '🤪', '#F1C40F', 1, '🧠', 'wisdom', 'A playful apology has been sent!'),
('foot-in-mouth', 'Foot-in-mouth disease', 'I plead guilty to a severe case of ''foot-in-mouth'' disease. I''m seeking treatment (and your forgiveness).', '🦶💬', '#F1C40F', 1, '🧠', 'wisdom', 'Someone''s admitting to foot-in-mouth disease!'),
('dingus-apology', 'I was a dingus', 'My sincerest apologies for being a bit of a dingus. I''ve sent my brain to timeout to think about what it''s done.', '🥴', '#F1C40F', 1, '🧠', 'wisdom', 'An apology for being a dingus just arrived.'),
('incredibly-grateful', 'Incredibly grateful for you', 'I''m so incredibly grateful for you. Your presence in my life is a gift I cherish every day.', '💝', '#3498DB', 2, '🧠', 'wisdom', 'Someone is incredibly grateful for you.'),
('my-rock', 'You are my rock', 'Thank you for being my rock, my confidant, and my biggest supporter. I don''t know what I''d do without you.', '🪨', '#3498DB', 2, '🧠', 'wisdom', 'You''re someone''s rock!'),
('your-happiness', 'Your happiness is my joy', 'Seeing you happy is my greatest joy. Thank you for everything you are and everything you do.', '😊', '#3498DB', 2, '🧠', 'wisdom', 'Your happiness brings someone joy.'),
('you-are-awesome', 'You''re awesome', 'Just wanted to say... you''re awesome.', '👍', '#2ECC71', 1, '🧠', 'wisdom', 'A quick note: You''re awesome!'),
('thinking-of-you', 'Thinking of you', 'Thinking of you and smiling.', '🤔💭', '#2ECC71', 1, '🧠', 'wisdom', 'Someone is thinking of you.'),
('make-my-world-better', 'You make my world better', 'You make my world better.', '🌍', '#2ECC71', 1, '🧠', 'wisdom', 'You make someone''s world better.'),
('time-for-us', 'Time for just us', 'Let''s make some time for just us soon. I miss you.', '⏳', '#9B59B6', 3, '🧠', 'wisdom', 'A call for some quality time together!'),
('brighter-day', 'Make your day brighter', 'Is there anything I can do to make your day a little brighter?', '☀️', '#9B59B6', 3, '🧠', 'wisdom', 'An offer to make your day brighter.'),
('remember-that-time', 'Remember that time?', 'Remember that time we...? Let''s do something like that again.', '💖', '#9B59B6', 3, '🧠', 'wisdom', 'A trip down memory lane has been suggested!'); 
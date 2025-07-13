-- This migration creates and seeds the dont_panic_templates and ping_templates tables.
-- It is idempotent and can be safely run multiple times.

-- Create the dont_panic_templates table
CREATE TABLE IF NOT EXISTS "public"."dont_panic_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "points" INTEGER DEFAULT 1,
    "points_icon" TEXT DEFAULT '⛑️',
    "point_unit" TEXT DEFAULT 'calm',
    "notification_text" TEXT,
    "is_active" BOOLEAN DEFAULT TRUE NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE "public"."dont_panic_templates" IS 'Templates for pre-defined ''Don''t Panic'' messages.';

-- Seed the dont_panic_templates data
INSERT INTO "public"."dont_panic_templates" ("id", "title", "description", "icon", "color", "points", "points_icon", "point_unit", "notification_text") VALUES
('everything-okay', 'Everything will be okay', 'No worries, take a deep breath. You are alive ❤️, rest can wait.', '🫂', '#6366F1', 1, '⛑️', 'calm', 'Your partner sent you a calming message.'),
('here-for-you', 'I''m here for you', 'I''m here for you, always. You''re not alone in this ❤️', '🤗', '#8B5CF6', 1, '⛑️', 'calm', 'Your partner is here for you.'),
('youre-safe', 'You''re safe and loved', 'You''re safe now, I love you. This feeling will pass ❤️', '🛡️', '#10B981', 1, '⛑️', 'calm', 'You are safe and loved.'),
('talk-when-ready', 'Let''s talk when you''re ready', 'No pressure, just love 💕', '💬', '#F59E0B', 1, '⛑️', 'calm', 'Your partner is ready to talk when you are.'),
('calm-energy', 'Sending Yoda might force', 'May the force be with you and stay calm.🕊️✨', '🕊️', '#84CC16', 1, '⛑️', 'calm', 'Your partner is sending you calm energy.')
ON CONFLICT (id) DO NOTHING;

-- Create the ping_templates table
CREATE TABLE IF NOT EXISTS "public"."ping_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "points" INTEGER DEFAULT 1,
    "points_icon" TEXT DEFAULT '🏓',
    "point_unit" TEXT DEFAULT 'ping',
    "notification_text" TEXT,
    "is_active" BOOLEAN DEFAULT TRUE NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE "public"."ping_templates" IS 'Templates for pre-defined Ping messages.';

-- Seed the ping_templates data
INSERT INTO "public"."ping_templates" ("id", "title", "description", "icon", "color", "points", "points_icon", "point_unit", "notification_text") VALUES
('checking-in', 'Just checking in', 'A gentle nudge to see how you are.', '👋', '#3B82F6', 1, '🏓', 'ping', 'Your partner is checking in on you.'),
('worried', 'I''m a bit worried', 'Alles gut? Please text back when you get a chance.', '😟', '#F59E0B', 1, '🏓', 'ping', 'Your partner is a bit worried about you.'),
('urgent', 'URGENT: Are you safe and okay?', 'Please let me know you are okay as soon as possible.', '🚨', '#EF4444', 1, '🏓', 'ping', 'URGENT: Your partner needs to know if you are okay.'),
('hornet-alert', 'Hornet Alert', 'This is the final warning. Call or text me back asap.', '☣️', '#DC2626', 1, '🏓', 'ping', 'HORNET ALERT: Final warning from your partner.')
ON CONFLICT (id) DO NOTHING;


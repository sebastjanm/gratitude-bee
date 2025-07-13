-- Create the wisdom_templates table
CREATE TABLE "public"."wisdom_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
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
INSERT INTO "public"."wisdom_templates" ("id", "title", "description", "icon", "color") VALUES
('yes-dear', 'Yes, dear', 'I gracefully accept your perspective and wisdom. I will do as you say.', '👑', '#E67E22'),
('happy-wife-happy-life', 'Happy wife, happy life', 'I understand your priorities and harmony', '🏠', '#27AE60'),
('happy-husband-happy-life', 'Happy man, happy life', 'I understand your priorities and harmony', '👨', '#27AE60'),
('im-sorry-lady', 'I''m Sorry - ladies only :)', 'Im aplogizing but in no way am I admitting to anything', '💔', '#F87171'),
('im-sorry-man', 'I''m Sorry - man only :)', 'Sincere apology and commitment to making amends. Im guilty as charged.', '💔', '#F87171'); 
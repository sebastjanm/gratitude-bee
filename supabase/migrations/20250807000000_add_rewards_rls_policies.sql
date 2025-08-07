-- Add RLS policies for rewards system tables

-- Enable RLS on tables
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ACHIEVEMENTS TABLE POLICIES
-- ============================================

-- Users can view their own and their partner's achievements
CREATE POLICY "Users can view their own and their partner's achievements"
ON achievements FOR SELECT
TO public
USING (
  (auth.uid() = user_id) OR 
  (user_id = (SELECT partner_id FROM users WHERE id = auth.uid()))
);

-- Allow postgres to manage achievements via trigger
CREATE POLICY "Allow postgres to manage achievements via trigger"
ON achievements FOR ALL
TO postgres
USING (true)
WITH CHECK (true);

-- No direct INSERT/UPDATE/DELETE for regular users
-- Achievements are only managed through database triggers

-- ============================================
-- ACHIEVEMENT_DEFINITIONS TABLE POLICIES
-- ============================================

-- Allow public read access to achievement definitions
CREATE POLICY "Allow public read access"
ON achievement_definitions FOR SELECT
TO public
USING (true);

-- Allow admins full access to achievement definitions
CREATE POLICY "Allow admins full access"
ON achievement_definitions FOR ALL
TO public
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- CATEGORIES TABLE POLICIES
-- ============================================

-- Allow public read access to active categories
CREATE POLICY "Allow public read access"
ON categories FOR SELECT
TO public
USING (is_active = true);

-- Allow admins full access to all categories
CREATE POLICY "Allow admins full access"
ON categories FOR ALL
TO public
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- SERVICE ROLE BYPASS
-- ============================================
-- Note: Service role (used by Edge Functions and triggers) bypasses RLS
-- This allows the achievement tracking trigger to update achievements
-- while preventing direct user manipulation
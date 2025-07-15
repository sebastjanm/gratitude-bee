-- This migration adds the avatar_url column and fixes RLS for the chat feature.

-- 1. Add avatar_url column to users table if it doesn't exist.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Drop the incorrect policy from `public.profiles` if it was accidentally created.
-- Note: This will fail harmlessly if the policy or table doesn't exist.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    DROP POLICY IF EXISTS "Allow authenticated users to see their conversation partners" ON public.profiles;
  END IF;
END $$;


-- 3. Add the correct RLS policy to `public.users` to allow viewing profiles of chat partners.
-- This policy is added alongside existing policies (permissive).
DROP POLICY IF EXISTS "Allow authenticated users to see their conversation partners" ON public.users;

CREATE POLICY "Allow authenticated users to see their conversation partners"
ON public.users
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT
      cp.user_id
    FROM
      public.conversation_participants AS cp
    WHERE
      cp.conversation_id IN (
        SELECT
          cp2.conversation_id
        FROM
          public.conversation_participants AS cp2
        WHERE
          cp2.user_id = auth.uid()
      )
  )
);

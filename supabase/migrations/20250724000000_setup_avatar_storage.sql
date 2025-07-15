-- Creates a new storage bucket for user avatars and sets up RLS policies.
-- 1. Create a new storage bucket named "avatars"
-- This will be used to store user profile images.
-- Make it public so that images can be easily accessed via URL.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Create RLS policy for viewing avatars
-- Allows any authenticated user to view any avatar.
-- This is necessary so users can see their partner's avatar in the chat.
CREATE POLICY "authenticated_users_can_view_avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- 3. Create RLS policy for uploading avatars
-- Allows a user to upload an avatar only for themselves.
-- The filename must be the user's ID.
CREATE POLICY "user_can_upload_own_avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 4. Create RLS policy for updating avatars
-- Allows a user to update their own avatar.
CREATE POLICY "user_can_update_own_avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 5. Create RLS policy for deleting avatars
-- Allows a user to delete their own avatar.
CREATE POLICY "user_can_delete_own_avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
); 
-- This migration sets up all necessary database objects for image messaging functionality.

-- 1. Add the 'uri' column to the 'messages' table to store image URLs.
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS uri TEXT;

-- 2. Create the 'chat_images' storage bucket if it doesn't already exist.
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_images', 'chat_images', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Define RLS policies for the chat_images storage bucket.
-- These policies are idempotent (they won't cause an error if they already exist).

-- Allow authenticated users to view images from their conversations.
DROP POLICY IF EXISTS "authenticated_users_can_view_chat_images" ON storage.objects;
CREATE POLICY "authenticated_users_can_view_chat_images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat_images' AND
  (SELECT conversation_id FROM public.messages WHERE id = (storage.foldername(name))[2]::uuid)
  IN (SELECT * FROM get_my_conversations())
);

-- Allow authenticated users to upload images to their conversations.
DROP POLICY IF EXISTS "authenticated_users_can_upload_chat_images" ON storage.objects;
CREATE POLICY "authenticated_users_can_upload_chat_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat_images' AND
  (storage.foldername(name))[1]::uuid = auth.uid() AND
  (storage.foldername(name))[2]::uuid IN (SELECT * FROM get_my_conversations())
);

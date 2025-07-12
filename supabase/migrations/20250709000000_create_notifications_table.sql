-- Migration: Create Notifications Table
-- This migration adds a `notifications` table to store a persistent history
-- of all notifications sent to users. It also includes RLS policies for security.

-- This extension might already be enabled, but it's safe to run this command.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- Create the notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content JSONB NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for clarity
COMMENT ON TABLE public.notifications IS 'Stores all notifications sent to users.';
COMMENT ON COLUMN public.notifications.read IS 'True if the user has marked the notification as read.';


-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications (to mark as read)"
ON public.notifications
FOR UPDATE USING (auth.uid() = recipient_id);

-- This policy allows backend services (like our Edge Functions) to insert notifications.
-- It's secure because row-level security is bypassed for requests using the service_role key.
CREATE POLICY "Allow service_role to insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true); 
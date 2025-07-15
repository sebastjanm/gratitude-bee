-- Phase 1: Backend Foundation (Supabase)
-- This migration creates the necessary tables, functions, triggers,
-- and RLS policies for the real-time chat module. It is designed
-- to be idempotent, meaning it can be run multiple times safely.

-- Step 1.1: Create Chat Tables

-- Table to store conversation threads
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    last_message text NULL,
    last_message_sent_at timestamp with time zone NULL,
    CONSTRAINT conversations_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE public.conversations IS 'Stores metadata for each chat thread.';

-- Table to store individual messages
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    text text NULL,
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
    CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE
);
COMMENT ON TABLE public.messages IS 'Stores individual chat messages.';

-- Junction table to link users to conversations
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    CONSTRAINT conversation_participants_pkey PRIMARY KEY (id),
    CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
    CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT conversation_participants_conversation_id_user_id_key UNIQUE (conversation_id, user_id)
);
COMMENT ON TABLE public.conversation_participants IS 'Links users to conversations.';

-- Step 1.2: Implement Server-Side Logic

-- Helper function to check if a user is part of a conversation.
-- This uses SECURITY DEFINER to bypass RLS checks and prevent recursion.
CREATE OR REPLACE FUNCTION public.is_participant(p_conversation_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
-- Set a secure search_path to prevent hijacking
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id = p_user_id
  );
$$;

-- Function to update conversation metadata on new message
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message = NEW.text,
    last_message_sent_at = NEW.created_at
  WHERE
    id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Trigger to execute the function after a new message is inserted
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_message();


-- Function to find or create a 1-on-1 conversation
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(user_one_id uuid, user_two_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    conversation_uuid uuid;
BEGIN
    -- Find existing conversation for 1-on-1 chats
    SELECT cp1.conversation_id INTO conversation_uuid
    FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    -- Ensure we are checking a 2-person conversation
    JOIN (
        SELECT conversation_id, count(id) as participant_count
        FROM conversation_participants
        GROUP BY conversation_id
    ) AS c_counts ON cp1.conversation_id = c_counts.conversation_id
    WHERE cp1.user_id = user_one_id 
      AND cp2.user_id = user_two_id
      AND c_counts.participant_count = 2;

    -- If not found, create a new one
    IF conversation_uuid IS NULL THEN
        INSERT INTO conversations DEFAULT VALUES RETURNING id INTO conversation_uuid;
        INSERT INTO conversation_participants (conversation_id, user_id) VALUES (conversation_uuid, user_one_id);
        INSERT INTO conversation_participants (conversation_id, user_id) VALUES (conversation_uuid, user_two_id);
    END IF;

    RETURN conversation_uuid;
END;
$$;


-- Step 1.3: Configure Realtime & RLS

-- Add tables to the publication so that Supabase Realtime can broadcast changes.
-- This is necessary for the live chat functionality to work.
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations, public.messages;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Tables already in publication, skipping.';
END
$$;

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see conversations they are part of.
DROP POLICY IF EXISTS "Allow read access to participants" ON public.conversations;
CREATE POLICY "Allow read access to participants"
ON public.conversations
FOR SELECT
USING (
  public.is_participant(id, auth.uid())
);

-- Users can only see messages in conversations they are part of.
DROP POLICY IF EXISTS "Allow read access to participants" ON public.messages;
CREATE POLICY "Allow read access to participants"
ON public.messages
FOR SELECT
USING (
  public.is_participant(conversation_id, auth.uid())
);

-- Users can only insert messages into conversations they are part of.
DROP POLICY IF EXISTS "Allow insert access to participants" ON public.messages;
CREATE POLICY "Allow insert access to participants"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  public.is_participant(conversation_id, auth.uid())
);

-- Users can see all participant records for any conversation they are a part of.
-- This is necessary to display participant names and details in the chat UI.
DROP POLICY IF EXISTS "Allow read access to fellow participants" ON public.conversation_participants;
CREATE POLICY "Allow read access to fellow participants"
ON public.conversation_participants
FOR SELECT
USING (
  public.is_participant(conversation_id, auth.uid())
); 
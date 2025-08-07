-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.achievement_definitions (
  type text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  target integer NOT NULL,
  reward_points integer DEFAULT 0,
  category text NOT NULL,
  event_type text,
  count_field text DEFAULT 'sender',
  CONSTRAINT achievement_definitions_pkey PRIMARY KEY (type)
);
CREATE TABLE public.achievement_rewards_log (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  achievement_type text NOT NULL,
  points_awarded integer NOT NULL,
  awarded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievement_rewards_log_pkey PRIMARY KEY (id),
  CONSTRAINT achievement_rewards_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  achievement_type text NOT NULL,
  unlocked_at timestamp without time zone,
  progress integer DEFAULT 0,
  target integer NOT NULL,
  CONSTRAINT achievements_pkey PRIMARY KEY (id),
  CONSTRAINT achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.appreciation_templates (
  id text NOT NULL,
  category_id text NOT NULL,
  title text NOT NULL,
  description text,
  points integer DEFAULT 1,
  points_icon text,
  point_unit text,
  icon text,
  notification_text text,
  is_active boolean DEFAULT true,
  CONSTRAINT appreciation_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categories (
  id text NOT NULL,
  name text NOT NULL,
  icon_name text NOT NULL,
  color text NOT NULL,
  sort_order integer DEFAULT 0,
  category_type text NOT NULL CHECK (category_type = ANY (ARRAY['appreciation'::text, 'favor'::text, 'special'::text])),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.conversation_participants (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  CONSTRAINT conversation_participants_pkey PRIMARY KEY (id),
  CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_message text,
  last_message_sent_at timestamp with time zone,
  CONSTRAINT conversations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.dont_panic_templates (
  id text NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  color text,
  points integer DEFAULT 1,
  points_icon text DEFAULT '⛑️'::text,
  point_unit text DEFAULT 'calm'::text,
  notification_text text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT dont_panic_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.events (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  event_type USER-DEFINED NOT NULL,
  status USER-DEFINED,
  content jsonb,
  reaction text,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id),
  CONSTRAINT events_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);
CREATE TABLE public.favor_templates (
  id text NOT NULL,
  category_id text NOT NULL,
  title text NOT NULL,
  description text,
  points integer DEFAULT 5,
  icon text,
  is_active boolean DEFAULT true,
  points_icon text NOT NULL DEFAULT '🌟'::text,
  notification_text text,
  CONSTRAINT favor_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.hornet_templates (
  id text NOT NULL,
  title text NOT NULL,
  description text,
  severity text,
  points integer,
  icon text,
  is_active boolean DEFAULT true,
  CONSTRAINT hornet_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  text text,
  uri text,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  recipient_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  type text NOT NULL,
  content jsonb NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id),
  CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);
CREATE TABLE public.ping_templates (
  id text NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  color text,
  points integer DEFAULT 1,
  points_icon text DEFAULT '🏓'::text,
  point_unit text DEFAULT 'ping'::text,
  notification_text text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ping_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  display_name text,
  partner_id uuid,
  invite_code text NOT NULL UNIQUE,
  expo_push_token text,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  avatar_url text,
  last_seen timestamp with time zone,
  email text,
  created_at timestamp with time zone,
  is_admin boolean DEFAULT false,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT users_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.users(id)
);
CREATE TABLE public.wallets (
  user_id uuid NOT NULL,
  appreciation_points jsonb DEFAULT '{}'::jsonb,
  favor_points integer DEFAULT 20,
  hornet_stings integer DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  wisdom_points integer DEFAULT 0,
  ping_points integer DEFAULT 0,
  dont_panic_points integer DEFAULT 0,
  CONSTRAINT wallets_pkey PRIMARY KEY (user_id),
  CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.wisdom_templates (
  id text NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  color text,
  points integer DEFAULT 1,
  points_icon text DEFAULT '🧠'::text,
  point_unit text DEFAULT 'wisdom'::text,
  notification_text text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT wisdom_templates_pkey PRIMARY KEY (id)
);
-- Migration: Update push notification trigger to use Supabase Vault
-- This change removes the hardcoded service_role_key from the trigger
-- and instead fetches it securely from Supabase Vault, which is the
-- recommended and most secure practice.

-- 1. Ensure pg_net is available
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA "extensions";

-- 2. Update the function to pull the key from Vault
CREATE OR REPLACE FUNCTION public.send_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_url TEXT := 'https://scdvcmxewjwkbvvcadhz.supabase.co';
  service_role_key TEXT; -- Key will be fetched from Vault
BEGIN
  -- Securely fetch the service_role_key from Supabase Vault
  -- Note: You must add 'service_role_key' to your project's Vault.
  SELECT decrypted_secret
  INTO service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key';

  IF service_role_key IS NULL THEN
    RAISE LOG '[Push Notification Trigger] service_role_key not found in Vault. Please add it in your Supabase project settings.';
    RETURN NULL;
  END IF;

  RAISE LOG '[Push Notification Trigger] Fired for event ID: %', NEW.id;
  
  -- Only send notifications for events that have a receiver
  IF NEW.receiver_id IS NOT NULL THEN
    RAISE LOG '[Push Notification Trigger] Receiver ID found: %. Calling Edge Function.', NEW.receiver_id;
    -- Call the edge function asynchronously using pg_net
    PERFORM net.http_post(
      url := project_url || '/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  ELSE
    RAISE LOG '[Push Notification Trigger] Receiver ID is NULL. Skipping notification.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. The trigger definition itself doesn't need to change.
DROP TRIGGER IF EXISTS trigger_send_push_notification ON public.events;

CREATE TRIGGER trigger_send_push_notification
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_notification();

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.send_push_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_push_notification() TO service_role; 
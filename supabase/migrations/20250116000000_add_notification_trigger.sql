-- Migration: Add automatic push notification trigger
-- This trigger calls the send-notification edge function whenever a new event is inserted
-- Ensures partners get notified immediately when they receive badges, favors, pings, etc.

-- Create a function that calls the notification edge function
CREATE OR REPLACE FUNCTION public.send_push_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send notifications for events that have a receiver
  IF NEW.receiver_id IS NOT NULL THEN
    -- Call the edge function asynchronously using pg_net
    PERFORM net.http_post(
      url := 'https://scdvcmxewjwkbvvcadhz.supabase.co/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZHZjbXhld2p3a2J2dmNhZGh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgyMTAwOCwiZXhwIjoyMDY3Mzk3MDA4fQ.nNUQog4AtvAO8t4NLWyF0FZHDdTsoDEFM6kEZFSaHKo'
      ),
      body := jsonb_build_object('eventId', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that fires after each insert on the events table
DROP TRIGGER IF EXISTS trigger_send_push_notification ON public.events;

CREATE TRIGGER trigger_send_push_notification
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_notification();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.send_push_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_push_notification() TO service_role; 
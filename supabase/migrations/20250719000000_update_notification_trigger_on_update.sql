-- Migration to update the push notification trigger to fire on UPDATE events.
-- This ensures that notifications are sent when an event's status changes,
-- such as when a favor is accepted, declined, or completed.

-- Drop the existing trigger
DROP TRIGGER IF EXISTS trigger_send_push_notification ON public.events;

-- Recreate the trigger to fire on both INSERT and UPDATE
CREATE TRIGGER trigger_send_push_notification
  AFTER INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_notification();

-- Grant necessary permissions (re-granting is safe)
GRANT EXECUTE ON FUNCTION public.send_push_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_push_notification() TO service_role; 
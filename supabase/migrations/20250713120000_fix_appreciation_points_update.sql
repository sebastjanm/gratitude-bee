-- This migration provides a more robust fix for the handle_event_points function.
--
-- Changes:
-- - It handles cases where the 'appreciation_points' column is NULL by treating it
--   as an empty JSONB object ('{}'). This prevents the jsonb_set function from
--   returning NULL and erasing the data.
-- - It simplifies the logic by performing the point calculation and update in a single,
--   atomic UPDATE statement, removing the need for a separate SELECT.

CREATE OR REPLACE FUNCTION public.handle_event_points()
RETURNS TRIGGER AS $$
DECLARE
    appreciation_category text;
    points_to_add int;
BEGIN
    -- Update receiver's wallet based on event type
    IF TG_OP = 'INSERT' THEN
        IF NEW.event_type = 'APPRECIATION' THEN
            appreciation_category := NEW.content->>'category_id';
            points_to_add := (NEW.content->>'points')::int;

            UPDATE public.wallets
            SET
                appreciation_points = jsonb_set(
                    COALESCE(appreciation_points, '{}'::jsonb),
                    ARRAY[appreciation_category],
                    to_jsonb(COALESCE((appreciation_points->>appreciation_category)::int, 0) + points_to_add),
                    true -- Create the key if it doesn't exist
                ),
                updated_at = now()
            WHERE user_id = NEW.receiver_id;

        ELSIF NEW.event_type = 'HORNET' THEN
            points_to_add := (NEW.content->>'points')::int; -- This is a negative number
            UPDATE public.wallets
            SET hornet_stings = hornet_stings + points_to_add, updated_at = now()
            WHERE user_id = NEW.receiver_id;

        ELSIF NEW.event_type = 'PING_RESPONSE' THEN
             UPDATE public.wallets
            SET
                appreciation_points = jsonb_set(
                    COALESCE(appreciation_points, '{}'::jsonb),
                    ARRAY['ping_response'],
                    to_jsonb(COALESCE((appreciation_points->>'ping_response')::int, 0) + 1),
                    true
                ),
                updated_at = now()
            WHERE user_id = NEW.receiver_id;
        END IF;

    -- Handle updates (e.g., favor completion)
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.event_type = 'FAVOR_REQUEST' AND NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
            points_to_add := (NEW.content->>'points')::int;
            -- Award points to the receiver of the event (who completed the favor)
            UPDATE public.wallets
            SET favor_points = favor_points + points_to_add, updated_at = now()
            WHERE user_id = NEW.receiver_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
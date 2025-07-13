-- This migration updates the handle_event_points function to include logic for all new event types,
-- routing points to their correct, dedicated columns in the wallets table.
-- It correctly handles APPRECIATION, WISDOM, DONT_PANIC, PING_RESPONSE, and HORNET events.

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
                    true
                ),
                updated_at = now()
            WHERE user_id = NEW.receiver_id;

        ELSIF NEW.event_type = 'WISDOM' THEN
            points_to_add := (NEW.content->>'points')::int;
            UPDATE public.wallets
            SET wisdom_points = wisdom_points + points_to_add, updated_at = now()
            WHERE user_id = NEW.receiver_id;

        ELSIF NEW.event_type = 'DONT_PANIC' THEN
            points_to_add := (NEW.content->>'points')::int;
            UPDATE public.wallets
            SET dont_panic_points = dont_panic_points + points_to_add, updated_at = now()
            WHERE user_id = NEW.receiver_id;

        ELSIF NEW.event_type = 'HORNET' THEN
            points_to_add := (NEW.content->>'points')::int; -- This is a negative number
            UPDATE public.wallets
            SET hornet_stings = hornet_stings + points_to_add, updated_at = now()
            WHERE user_id = NEW.receiver_id;

        ELSIF NEW.event_type = 'PING_RESPONSE' THEN
            -- Add a fixed 1 point for a ping response.
             UPDATE public.wallets
            SET ping_points = ping_points + 1, updated_at = now()
            WHERE user_id = NEW.receiver_id; -- The person who responded
        END IF;

    -- Handle updates (e.g., favor completion)
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.event_type = 'FAVOR_REQUEST' AND NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
            points_to_add := (NEW.content->>'points')::int;
            UPDATE public.wallets
            SET favor_points = favor_points + points_to_add, updated_at = now()
            WHERE user_id = NEW.receiver_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


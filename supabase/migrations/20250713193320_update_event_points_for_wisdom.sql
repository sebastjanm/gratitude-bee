-- This migration updates the handle_event_points function to include logic for all new event types,
-- routing points to their correct, dedicated columns in the wallets table.
-- It correctly handles APPRECIATION, WISDOM, DONT_PANIC, PING_RESPONSE, and HORNET events.
--
-- FIX: The logic for WISDOM events has been updated to correctly look up points
-- from the wisdom_templates table using the template_id from the event content,
-- instead of incorrectly expecting points to be in the content itself.
--
-- REFACTOR: The logic for all event types (APPRECIATION, HORNET, FAVOR_REQUEST, DONT_PANIC, PING_RESPONSE)
-- has been refactored to look up point values from their respective template tables on the server.
-- This ensures consistency and security, making the database the single source of truth
-- for point values, rather than trusting the client to provide them.

CREATE OR REPLACE FUNCTION public.handle_event_points()
RETURNS TRIGGER AS $$
DECLARE
    points_to_add int;
    template_id_text text;
    appreciation_category text;
BEGIN
    -- Update receiver's wallet based on event type
    IF TG_OP = 'INSERT' THEN
        IF NEW.event_type = 'APPRECIATION' THEN
            template_id_text := NEW.content->>'template_id';
            appreciation_category := NEW.content->>'category_id';

            -- Look up points from the appreciation_templates table
            SELECT points INTO points_to_add FROM public.appreciation_templates WHERE id = template_id_text;

            IF points_to_add IS NOT NULL THEN
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
            END IF;

        ELSIF NEW.event_type = 'WISDOM' THEN
            template_id_text := NEW.content->>'template_id';
            
            -- Look up points from the wisdom_templates table
            SELECT points INTO points_to_add FROM public.wisdom_templates WHERE id = template_id_text;

            IF points_to_add IS NOT NULL THEN
                UPDATE public.wallets
                SET wisdom_points = wisdom_points + points_to_add, updated_at = now()
                WHERE user_id = NEW.receiver_id;
            END IF;

        ELSIF NEW.event_type = 'DONT_PANIC' THEN
            template_id_text := NEW.content->>'template_id';
            -- Look up points from the dont_panic_templates table
            SELECT points INTO points_to_add FROM public.dont_panic_templates WHERE id = template_id_text;

            IF points_to_add IS NOT NULL THEN
                UPDATE public.wallets
                SET dont_panic_points = dont_panic_points + points_to_add, updated_at = now()
                WHERE user_id = NEW.receiver_id;
            END IF;

        ELSIF NEW.event_type = 'HORNET' THEN
            template_id_text := NEW.content->>'template_id';
            
            -- Look up points from the hornet_templates table
            SELECT points INTO points_to_add FROM public.hornet_templates WHERE id = template_id_text;

            IF points_to_add IS NOT NULL THEN
                UPDATE public.wallets
                SET hornet_stings = hornet_stings + points_to_add, updated_at = now()
                WHERE user_id = NEW.receiver_id;
            END IF;

        ELSIF NEW.event_type = 'PING_RESPONSE' THEN
            template_id_text := NEW.content->>'template_id';
            -- Look up points from the ping_templates table
            SELECT points INTO points_to_add FROM public.ping_templates WHERE id = template_id_text;
            
            IF points_to_add IS NOT NULL THEN
                UPDATE public.wallets
                SET ping_points = ping_points + points_to_add, updated_at = now()
                WHERE user_id = NEW.receiver_id; -- The person who responded
            END IF;
        END IF;

    -- Handle updates for favor completion
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.event_type = 'FAVOR_REQUEST' AND NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
            template_id_text := NEW.content->>'template_id';
            
            -- Look up points from the favor_templates table
            SELECT points INTO points_to_add FROM public.favor_templates WHERE id = template_id_text;
            
            IF points_to_add IS NOT NULL THEN
                UPDATE public.wallets
                SET favor_points = favor_points + points_to_add, updated_at = now()
                WHERE user_id = NEW.receiver_id;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


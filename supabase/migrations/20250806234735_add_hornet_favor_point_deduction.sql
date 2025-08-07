-- Add Hornet Favor Point Deduction Feature
-- This migration updates the handle_event_points function to make Hornets deduct favor points
-- from the receiver, creating a real economic consequence for negative feedback.
--
-- Changes:
-- - Hornets now deduct favor points from the receiver (same amount as their negative value)
-- - Hornet_stings still tracked separately for accountability
-- - Favor points cannot go below 0 (protection against negative balance)

CREATE OR REPLACE FUNCTION public.handle_event_points()
RETURNS TRIGGER AS $$
DECLARE
    points_to_add int;
    points_to_deduct int;
    template_id_text text;
    appreciation_category text;
BEGIN
    -- Update receiver's wallet based on event type
    IF TG_OP = 'INSERT' THEN
        IF NEW.event_type = 'APPRECIATION' THEN
            appreciation_category := NEW.content->>'category_id';
            template_id_text := NEW.content->>'template_id';
            
            -- Look up points from the appreciation_templates table
            SELECT points INTO points_to_add FROM public.appreciation_templates WHERE id = template_id_text;
            
            IF points_to_add IS NOT NULL THEN
                UPDATE public.wallets
                SET appreciation_points = jsonb_set(
                    appreciation_points,
                    ARRAY[appreciation_category],
                    (COALESCE(appreciation_points->>appreciation_category, '0')::int + points_to_add)::text::jsonb,
                    true -- Create the key if it doesn't exist
                ), updated_at = now()
                WHERE user_id = NEW.receiver_id;
            END IF;
        
        ELSIF NEW.event_type = 'WISDOM' THEN
            template_id_text := NEW.content->>'template_id';
            
            -- Look up points from the wisdom_templates table
            SELECT points INTO points_to_add FROM public.wisdom_templates WHERE id = template_id_text;

            IF points_to_add IS NOT NULL THEN
                UPDATE public.wallets
                SET wisdom_points = COALESCE(wisdom_points, 0) + points_to_add, updated_at = now()
                WHERE user_id = NEW.receiver_id;
            END IF;

        ELSIF NEW.event_type = 'DONT_PANIC' THEN
            template_id_text := NEW.content->>'template_id';
            -- Look up points from the dont_panic_templates table
            SELECT points INTO points_to_add FROM public.dont_panic_templates WHERE id = template_id_text;

            IF points_to_add IS NOT NULL THEN
                UPDATE public.wallets
                SET dont_panic_points = COALESCE(dont_panic_points, 0) + points_to_add, updated_at = now()
                WHERE user_id = NEW.receiver_id;
            END IF;

        ELSIF NEW.event_type = 'HORNET' THEN
            template_id_text := NEW.content->>'template_id';
            
            -- Look up points from the hornet_templates table
            SELECT points INTO points_to_add FROM public.hornet_templates WHERE id = template_id_text;

            IF points_to_add IS NOT NULL THEN
                -- Update hornet_stings count (for tracking)
                -- Hornet points are stored as negative values in the database
                UPDATE public.wallets
                SET hornet_stings = COALESCE(hornet_stings, 0) + points_to_add, 
                    updated_at = now()
                WHERE user_id = NEW.receiver_id;
                
                -- DEDUCT favor points from receiver (new behavior)
                -- Since hornet points are negative (e.g., -25), we use ABS to get the deduction amount
                -- This ensures we always deduct a positive number of favor points
                points_to_deduct := ABS(points_to_add);  -- Convert negative to positive for deduction
                
                UPDATE public.wallets
                SET favor_points = GREATEST(0, COALESCE(favor_points, 0) - points_to_deduct),
                    updated_at = now()
                WHERE user_id = NEW.receiver_id;
                
                -- Log the deduction for transparency
                RAISE NOTICE 'Hornet deducted % favor points from user %', points_to_deduct, NEW.receiver_id;
            END IF;

        ELSIF NEW.event_type = 'PING_RESPONSE' THEN
            template_id_text := NEW.content->>'template_id';
            -- Look up points from the ping_templates table
            SELECT points INTO points_to_add FROM public.ping_templates WHERE id = template_id_text;
            
            IF points_to_add IS NOT NULL THEN
                UPDATE public.wallets
                SET ping_points = COALESCE(ping_points, 0) + points_to_add, updated_at = now()
                WHERE user_id = NEW.sender_id; -- Award points to the sender, who is the one responding.
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
                SET favor_points = COALESCE(favor_points, 0) + points_to_add, updated_at = now()
                WHERE user_id = NEW.receiver_id;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION QUERIES (Run these after migration)
-- ============================================
-- Check current hornet template values:
-- SELECT * FROM hornet_templates;
--
-- Test the deduction by checking a user's wallet before and after receiving a hornet:
-- SELECT user_id, favor_points, hornet_stings FROM wallets WHERE user_id = '[user_id]';
--
-- View recent hornet events and their impact:
-- SELECT 
--   e.created_at,
--   e.sender_id,
--   e.receiver_id,
--   e.content->>'template_id' as hornet_type,
--   ht.points as deduction_amount,
--   w.favor_points as current_favor_points,
--   w.hornet_stings as total_stings
-- FROM events e
-- JOIN hornet_templates ht ON ht.id = e.content->>'template_id'
-- JOIN wallets w ON w.user_id = e.receiver_id
-- WHERE e.event_type = 'HORNET'
-- ORDER BY e.created_at DESC
-- LIMIT 10;
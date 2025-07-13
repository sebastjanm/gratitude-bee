-- This migration recreates the get_daily_stats function with a more robust structure
-- to prevent silent failures within the function's execution context.
--
-- Changes:
-- - The subquery for 'appreciation_points' is rewritten to avoid an implicit
--   CROSS JOIN, which was likely interacting poorly with RLS policies and
--   causing a result of 0. This new structure is more stable.

DROP FUNCTION IF EXISTS public.get_daily_stats(p_user_id uuid);

CREATE OR REPLACE FUNCTION get_daily_stats(p_user_id uuid)
RETURNS TABLE(sent_today bigint, received_today bigint, favor_points integer, appreciation_points integer) AS $$
BEGIN
    RETURN QUERY
    WITH daily_events AS (
        SELECT * FROM events
        WHERE created_at >= date_trunc('day', now()) AND created_at < date_trunc('day', now()) + interval '1 day'
    )
    SELECT
        (SELECT count(*) FROM daily_events WHERE sender_id = p_user_id) AS sent_today,
        (SELECT count(*) FROM daily_events WHERE receiver_id = p_user_id) AS received_today,
        (SELECT w.favor_points FROM wallets w WHERE w.user_id = p_user_id) AS favor_points,
        (
            SELECT COALESCE( (SELECT SUM(value::int) FROM jsonb_each_text(w.appreciation_points)), 0)
            FROM wallets w
            WHERE w.user_id = p_user_id
        )::integer AS appreciation_points;
END;
$$ LANGUAGE plpgsql; 
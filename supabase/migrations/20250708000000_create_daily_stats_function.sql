CREATE OR REPLACE FUNCTION get_daily_stats(p_user_id uuid)
RETURNS TABLE(sent_today bigint, received_today bigint, favor_points integer) AS $$
BEGIN
    RETURN QUERY
    WITH daily_events AS (
        SELECT * FROM events
        WHERE created_at >= date_trunc('day', now()) AND created_at < date_trunc('day', now()) + interval '1 day'
    )
    SELECT
        (SELECT count(*) FROM daily_events WHERE sender_id = p_user_id) AS sent_today,
        (SELECT count(*) FROM daily_events WHERE receiver_id = p_user_id) AS received_today,
        (SELECT w.favor_points FROM wallets w WHERE w.user_id = p_user_id) AS favor_points;
END;
$$ LANGUAGE plpgsql; 
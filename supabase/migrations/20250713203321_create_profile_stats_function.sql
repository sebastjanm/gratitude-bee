-- This migration creates the get_user_profile_stats function.
-- This function calculates the main statistics for the user profile screen.

create or replace function get_user_profile_stats(p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  stats_json jsonb;
begin
  with
  all_events as (
    select * from public.events
    where sender_id = p_user_id or receiver_id = p_user_id
  ),
  sent_events as (
    select * from all_events where sender_id = p_user_id
  ),
  received_events as (
    select * from all_events where receiver_id = p_user_id
  ),
  -- Streak logic
  all_sent_appreciations as (
    select distinct created_at::date as appreciation_date
    from public.events
    where sender_id = p_user_id and event_type = 'APPRECIATION'
  ),
  date_groups as (
    select
      appreciation_date,
      appreciation_date - (row_number() over (order by appreciation_date))::int * interval '1 day' as grp
    from all_sent_appreciations
  ),
  streaks as (
    select
      count(*) as length,
      max(appreciation_date) as last_day
    from date_groups
    group by grp
    order by last_day desc
  ),
  -- Days active logic
  active_days as (
    select count(distinct created_at::date) as count
    from all_events
  )
  select
    jsonb_build_object(
      'badges_sent', (select count(*) from sent_events),
      'badges_received', (select count(*) from received_events),
      'day_streak', (
        select
          case
            when last_day >= current_date - interval '1 day' then length
            else 0
          end
        from streaks
        limit 1
      ),
      'days_active', (select count from active_days)
    )
  into stats_json;

  return stats_json;

end;
$$;

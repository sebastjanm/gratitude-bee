-- Create the analytics function
-- This function calculates all statistics for the analytics screen on the server-side
-- for improved performance and scalability.

create or replace function get_user_analytics(p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_partner_id uuid;
  main_stats_json jsonb;
  weekly_data_json jsonb;
  category_stats_json jsonb;
  insights_json jsonb;
  result_json jsonb;
begin
  -- Get partner ID for relational stats
  select partner_id into v_partner_id from public.users where id = p_user_id;

  -- === 1. Main Stats ===
  with
  sent_events as (
    select * from public.events where sender_id = p_user_id
  ),
  received_events as (
    select * from public.events where receiver_id = p_user_id
  ),
  appreciation_dates as (
    select distinct created_at::date as appreciation_date
    from sent_events
    where event_type = 'APPRECIATION'
  ),
  date_groups as (
    select
      appreciation_date,
      appreciation_date - (row_number() over (order by appreciation_date))::int * interval '1 day' as grp
    from appreciation_dates
  ),
  streaks as (
    select
      count(*) as length,
      max(appreciation_date) as last_day
    from date_groups
    group by grp
    order by last_day desc
  )
  select
    jsonb_build_object(
      'total_sent', (select count(*) from sent_events),
      'total_received', (select count(*) from received_events),
      'current_streak', (
        select
          case
            when last_day >= current_date - interval '1 day' then length
            else 0
          end
        from streaks
        limit 1
      ),
      'longest_streak', (select coalesce(max(length), 0) from streaks),
      'daily_average', round((select count(*) from sent_events) / 30.0, 1)
    )
  into main_stats_json;

  -- === 2. Weekly Breakdown ===
  select
    jsonb_agg(stats)
  from (
    select
      case
        when i = 0 then 'This Week'
        when i = 1 then 'Last Week'
        else i || ' Weeks Ago'
      end as week,
      coalesce(sum(case when event_type <> 'HORNET' then 1 else 0 end), 0)::int as positive,
      coalesce(sum(case when event_type = 'HORNET' then 1 else 0 end), 0)::int as negative,
      coalesce(count(e.id), 0)::int as total
    from generate_series(0, 3) as i
    left join public.events e on e.created_at::date between
      (date_trunc('week', current_date) - (i * interval '1 week'))::date and
      (date_trunc('week', current_date) + interval '6 days' - (i * interval '1 week'))::date
      and (e.sender_id = p_user_id or e.receiver_id = p_user_id)
    group by i
    order by i asc
  ) as stats
  into weekly_data_json;

  -- === 3. Category Breakdown ===
  select
    jsonb_agg(jsonb_build_object(
      'name', name,
      'sent', sent,
      'received', received,
      'color', color
    ))
  from (
    select
      initcap(coalesce(e.content->>'category_id', e.event_type::text)) as name,
      sum(case when e.sender_id = p_user_id then 1 else 0 end) as sent,
      sum(case when e.receiver_id = p_user_id then 1 else 0 end) as received,
      case coalesce(e.content->>'category_id', e.event_type::text)
        when 'humor' then '#FFD93D'
        when 'kindness' then '#FF6B9D'
        when 'support' then '#4ECDC4'
        when 'words' then '#A8E6CF'
        when 'adventure' then '#6BCF7F'
        when 'HORNET' then '#FF4444'
        else '#6B7280'
      end as color
    from public.events e
    where e.event_type in ('APPRECIATION', 'HORNET')
    group by coalesce(e.content->>'category_id', e.event_type::text)
  ) as category_data
  into category_stats_json;

  -- === 4. Insights ===
  with
  sent_events as (
    select * from public.events where sender_id = p_user_id
  ),
  received_events as (
    select * from public.events where receiver_id = p_user_id
  ),
  sent_counts as (
      select count(*) as val from sent_events
  ),
  received_counts as (
      select count(*) as val from received_events
  )
  select
    jsonb_build_object(
      'most_active_day', (
        select trim(to_char(created_at, 'Day'))
        from sent_events
        group by 1
        order by count(*) desc
        limit 1
      ),
      'favorite_category', (
        select initcap(coalesce(content->>'category_id', event_type::text))
        from sent_events
        where event_type in ('APPRECIATION', 'HORNET')
        group by 1
        order by count(*) desc
        limit 1
      ),
      'partner_favorite_category', (
        select initcap(coalesce(content->>'category_id', event_type::text))
        from received_events
        where event_type in ('APPRECIATION', 'HORNET')
        group by 1
        order by count(*) desc
        limit 1
      ),
      'balance_score', (
          select
            case
              when (select val from sent_counts) = 0 or (select val from received_counts) = 0 then 'N/A'
              else round(
                least((select val from sent_counts), (select val from received_counts))::numeric
                /
                greatest((select val from sent_counts), (select val from received_counts))::numeric * 100
              )::text || '%'
            end
      )
    )
  into insights_json;

  -- === Assemble Final Result ===
  select jsonb_build_object(
    'main_stats', main_stats_json,
    'weekly_data', weekly_data_json,
    'category_stats', category_stats_json,
    'insights', insights_json
  ) into result_json;

  return result_json;
end;
$$; 
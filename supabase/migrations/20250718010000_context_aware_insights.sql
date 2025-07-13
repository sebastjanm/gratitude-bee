-- 20250718010000_context_aware_insights.sql
-- Refactor get_user_analytics to provide context-aware insights per period.
-- For 'today', show: streak status, first/last event time, category breakdown, and most active hour.
-- For 'week', 'month', 'all', keep most active day, favorite category, partner favorite, balance score.
-- Remove misleading KPIs for 'today'.

drop function if exists get_user_analytics(uuid, text);

create or replace function get_user_analytics(p_user_id uuid, p_period text default 'month')
returns jsonb
language plpgsql
security definer
as $$
declare
  v_partner_id uuid;
  main_stats_json jsonb;
  breakdown_data_json jsonb;
  breakdown_title text;
  category_stats_json jsonb;
  insights_json jsonb;
  result_json jsonb;
  start_date timestamptz;
  end_date timestamptz;
begin
  -- Determine date range based on period
  case p_period
    when 'today' then
      start_date := date_trunc('day', now());
      end_date := start_date + interval '1 day';
      breakdown_title := 'Today''s Hourly Breakdown';
    when 'week' then
      start_date := date_trunc('week', now());
      end_date := start_date + interval '1 week';
      breakdown_title := 'This Week''s Daily Breakdown';
    when 'month' then
      start_date := date_trunc('month', now());
      end_date := start_date + interval '1 month';
      breakdown_title := 'This Month''s Weekly Breakdown';
    else -- 'all'
      start_date := '1970-01-01'::timestamptz;
      end_date := now() + interval '1 day';
      breakdown_title := 'All-Time Monthly Breakdown';
  end case;

  -- Get partner ID for relational stats
  select partner_id into v_partner_id from public.users where id = p_user_id;

  -- === 1. Main Stats (Calculated within the filtered period) ===
  with
  all_events as (
    select * from public.events
    where created_at >= start_date and created_at < end_date
    and (sender_id = p_user_id or receiver_id = p_user_id)
  ),
  sent_events as (
    select * from all_events where sender_id = p_user_id
  ),
  received_events as (
    select * from all_events where receiver_id = p_user_id
  ),
  -- Streak logic needs all-time data, so we query it separately
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
      'daily_average', round((select count(*) from sent_events) / greatest(extract(day from end_date - start_date), 1), 1)
    )
  into main_stats_json;

  -- === 2. Dynamic Time-Series Breakdown ===
  if p_period = 'today' then
    select
      jsonb_agg(stats)
    from (
      select
        to_char(h, 'HH24:00') as label,
        coalesce(sum(case when event_type <> 'HORNET' then 1 else 0 end), 0)::int as positive,
        coalesce(sum(case when event_type = 'HORNET' then 1 else 0 end), 0)::int as negative,
        coalesce(count(e.id), 0)::int as total
      from generate_series(date_trunc('day', now()), date_trunc('day', now()) + interval '23 hours', '1 hour') as h
      left join public.events e on date_trunc('hour', e.created_at) = h
        and (e.sender_id = p_user_id or e.receiver_id = p_user_id)
      group by h
      order by h asc
    ) as stats
    into breakdown_data_json;
  elsif p_period = 'week' then
    select
      jsonb_agg(stats)
    from (
      select
        to_char(d, 'Dy') as label,
        coalesce(sum(case when event_type <> 'HORNET' then 1 else 0 end), 0)::int as positive,
        coalesce(sum(case when event_type = 'HORNET' then 1 else 0 end), 0)::int as negative,
        coalesce(count(e.id), 0)::int as total
      from generate_series(start_date, end_date - interval '1 day', '1 day') as d
      left join public.events e on e.created_at::date = d::date
        and (e.sender_id = p_user_id or e.receiver_id = p_user_id)
      group by d
      order by d asc
    ) as stats
    into breakdown_data_json;
  elsif p_period = 'month' then
     select
      jsonb_agg(stats)
    from (
      select
        'Week ' || to_char(d, 'W') as label,
        coalesce(sum(case when event_type <> 'HORNET' then 1 else 0 end), 0)::int as positive,
        coalesce(sum(case when event_type = 'HORNET' then 1 else 0 end), 0)::int as negative,
        coalesce(count(e.id), 0)::int as total
      from generate_series(date_trunc('week', start_date), end_date - interval '1 day', '1 week') as d
      left join public.events e on date_trunc('week', e.created_at)::date = d::date
        and (e.sender_id = p_user_id or e.receiver_id = p_user_id)
      group by d
      order by d asc
    ) as stats
    into breakdown_data_json;
  else -- 'all'
    select
      jsonb_agg(stats)
    from (
      select
        to_char(m, 'YYYY-MM') as label,
        coalesce(sum(case when event_type <> 'HORNET' then 1 else 0 end), 0)::int as positive,
        coalesce(sum(case when event_type = 'HORNET' then 1 else 0 end), 0)::int as negative,
        coalesce(count(e.id), 0)::int as total
      from generate_series(
        coalesce((select date_trunc('month', min(created_at)) from public.events where sender_id = p_user_id or receiver_id = p_user_id), date_trunc('month', now())),
        now(),
        '1 month'
      ) as m
      left join public.events e on date_trunc('month', e.created_at)::date = m::date
        and (e.sender_id = p_user_id or e.receiver_id = p_user_id)
      group by m
      order by m asc
    ) as stats
    into breakdown_data_json;
  end if;

  -- === 3. Category Breakdown (Uses the period filter) ===
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
    and e.created_at >= start_date and e.created_at < end_date
    and (e.sender_id = p_user_id or e.receiver_id = p_user_id)
    group by coalesce(e.content->>'category_id', e.event_type::text)
  ) as category_data
  into category_stats_json;

  -- === 4. Insights (Context-aware per period) ===
  if p_period = 'today' then
    with
      sent_today as (
        select * from public.events
        where sender_id = p_user_id
          and created_at >= start_date and created_at < end_date
      ),
      received_today as (
        select * from public.events
        where receiver_id = p_user_id
          and created_at >= start_date and created_at < end_date
      ),
      first_event as (
        select min(created_at) as first_time from sent_today
      ),
      last_event as (
        select max(created_at) as last_time from sent_today
      ),
      most_active_hour as (
        select to_char(date_trunc('hour', created_at), 'HH24:00') as hour, count(*) as cnt
        from sent_today
        group by 1
        order by cnt desc
        limit 1
      ),
      category_breakdown as (
        select initcap(coalesce(content->>'category_id', event_type::text)) as category, count(*) as cnt
        from sent_today
        where event_type in ('APPRECIATION', 'HORNET')
        group by 1
        order by cnt desc
      )
    select jsonb_build_object(
      'streak_status', (
        select case when count(*) > 0 then 'On a streak!' else 'No streak today.' end from sent_today
      ),
      'first_event_time', (select to_char(first_time, 'HH24:MI') from first_event),
      'last_event_time', (select to_char(last_time, 'HH24:MI') from last_event),
      'most_active_hour', (select hour from most_active_hour),
      'category_breakdown', (select jsonb_agg(jsonb_build_object('category', category, 'count', cnt)) from category_breakdown)
    ) into insights_json;
  else
    with
      all_events as (
        select * from public.events
        where created_at >= start_date and created_at < end_date
        and (sender_id = p_user_id or receiver_id = p_user_id)
      ),
      sent_events as (
        select * from all_events where sender_id = p_user_id
      ),
      received_events as (
        select * from all_events where receiver_id = p_user_id
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
  end if;

  -- === Assemble Final Result ===
  select jsonb_build_object(
    'main_stats', main_stats_json,
    'breakdown_title', breakdown_title,
    'breakdown_data', breakdown_data_json,
    'category_stats', category_stats_json,
    'insights', insights_json
  ) into result_json;

  return result_json;
end;
$$; 
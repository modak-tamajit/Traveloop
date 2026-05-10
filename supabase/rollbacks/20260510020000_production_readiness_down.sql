-- Rollback companion for 20260510020000_production_readiness.sql.
-- Removes only artifacts introduced by that migration.

revoke execute on function public.record_trip_activity_event(uuid, text, text, uuid, jsonb) from authenticated;
drop function if exists public.record_trip_activity_event(uuid, text, text, uuid, jsonb);

drop table if exists public.seed_runs;
drop table if exists public.public_share_access_events;
drop table if exists public.trip_activity_events;

drop trigger if exists validate_itinerary_day_date on public.itinerary_days;
drop function if exists public.validate_itinerary_day_date();

drop trigger if exists increment_profiles_lock_version on public.profiles;
drop trigger if exists increment_cities_lock_version on public.cities;
drop trigger if exists increment_trips_lock_version on public.trips;
drop trigger if exists increment_activities_lock_version on public.activities;
drop trigger if exists increment_itinerary_days_lock_version on public.itinerary_days;
drop trigger if exists increment_itinerary_items_lock_version on public.itinerary_items;
drop trigger if exists increment_expenses_lock_version on public.expenses;
drop trigger if exists increment_packing_items_lock_version on public.packing_items;
drop trigger if exists increment_journal_entries_lock_version on public.journal_entries;
drop function if exists public.increment_lock_version();

alter table public.profiles drop constraint if exists profiles_metadata_object_check;
alter table public.cities drop constraint if exists cities_metadata_object_check;
alter table public.trips drop constraint if exists trips_metadata_object_check;
alter table public.activities drop constraint if exists activities_metadata_object_check;
alter table public.itinerary_days drop constraint if exists itinerary_days_metadata_object_check;
alter table public.itinerary_items drop constraint if exists itinerary_items_metadata_object_check;
alter table public.expenses drop constraint if exists expenses_metadata_object_check;
alter table public.packing_items drop constraint if exists packing_items_metadata_object_check;
alter table public.journal_entries drop constraint if exists journal_entries_metadata_object_check;

alter table public.profiles drop constraint if exists profiles_lock_version_check;
alter table public.cities drop constraint if exists cities_lock_version_check;
alter table public.trips drop constraint if exists trips_lock_version_check;
alter table public.activities drop constraint if exists activities_lock_version_check;
alter table public.itinerary_days drop constraint if exists itinerary_days_lock_version_check;
alter table public.itinerary_items drop constraint if exists itinerary_items_lock_version_check;
alter table public.expenses drop constraint if exists expenses_lock_version_check;
alter table public.packing_items drop constraint if exists packing_items_lock_version_check;
alter table public.journal_entries drop constraint if exists journal_entries_lock_version_check;

alter table public.profiles drop column if exists metadata;
alter table public.cities drop column if exists metadata;
alter table public.trips drop column if exists metadata;
alter table public.activities drop column if exists metadata;
alter table public.itinerary_days drop column if exists metadata;
alter table public.itinerary_items drop column if exists metadata;
alter table public.expenses drop column if exists metadata;
alter table public.packing_items drop column if exists metadata;
alter table public.journal_entries drop column if exists metadata;

alter table public.profiles drop column if exists lock_version;
alter table public.cities drop column if exists lock_version;
alter table public.trips drop column if exists lock_version;
alter table public.activities drop column if exists lock_version;
alter table public.itinerary_days drop column if exists lock_version;
alter table public.itinerary_items drop column if exists lock_version;
alter table public.expenses drop column if exists lock_version;
alter table public.packing_items drop column if exists lock_version;
alter table public.journal_entries drop column if exists lock_version;

alter table public.activities drop constraint if exists activities_currency_check;
alter table public.activities add constraint activities_currency_check
  check (char_length(currency) = 3);

alter table public.itinerary_items drop constraint if exists itinerary_items_currency_check;
alter table public.itinerary_items add constraint itinerary_items_currency_check
  check (char_length(currency) = 3);

create or replace function public.get_admin_analytics(
  p_from_date date default null,
  p_to_date date default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_from timestamptz := coalesce(p_from_date::timestamptz, '-infinity'::timestamptz);
  v_to timestamptz := coalesce((p_to_date + 1)::timestamptz, 'infinity'::timestamptz);
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'totals', jsonb_build_object(
      'users', (select count(*) from public.profiles),
      'trips', (select count(*) from public.trips where created_at >= v_from and created_at < v_to),
      'public_shares', (select count(*) from public.trips where is_public = true),
      'expenses_amount', (
        select coalesce(sum(e.amount), 0)
        from public.expenses e
        where e.created_at >= v_from and e.created_at < v_to
      ),
      'cities', (select count(*) from public.cities),
      'activities', (select count(*) from public.activities),
      'itinerary_items', (
        select count(*) from public.itinerary_items
        where created_at >= v_from and created_at < v_to
      ),
      'packing_items', (
        select count(*) from public.packing_items
        where created_at >= v_from and created_at < v_to
      ),
      'journal_entries', (
        select count(*) from public.journal_entries
        where created_at >= v_from and created_at < v_to
      )
    ),
    'trips_by_status', coalesce((
      select jsonb_object_agg(status, count)
      from (
        select status, count(*)::integer as count
        from public.trips
        where created_at >= v_from and created_at < v_to
        group by status
      ) s
    ), '{}'::jsonb),
    'expenses_by_category', coalesce((
      select jsonb_object_agg(category, jsonb_build_object('count', count, 'amount', amount))
      from (
        select category, count(*)::integer as count, coalesce(sum(amount), 0) as amount
        from public.expenses
        where created_at >= v_from and created_at < v_to
        group by category
      ) e
    ), '{}'::jsonb),
    'top_cities', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'city_id', c.id,
          'name', c.name,
          'country', c.country,
          'trip_count', stats.trip_count
        )
        order by stats.trip_count desc, c.name
      )
      from (
        select primary_city_id, count(*)::integer as trip_count
        from public.trips
        where primary_city_id is not null
          and created_at >= v_from
          and created_at < v_to
        group by primary_city_id
        order by count(*) desc
        limit 10
      ) stats
      join public.cities c on c.id = stats.primary_city_id
    ), '[]'::jsonb),
    'daily_trip_creations', coalesce((
      select jsonb_agg(
        jsonb_build_object('date', day, 'count', count)
        order by day
      )
      from (
        select created_at::date as day, count(*)::integer as count
        from public.trips
        where created_at >= v_from and created_at < v_to
        group by created_at::date
        order by created_at::date
      ) d
    ), '[]'::jsonb)
  );
end;
$$;

grant execute on function public.get_admin_analytics(date, date) to authenticated;

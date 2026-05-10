-- Traveloop / Safarnama production readiness hardening
-- Run after 20260510010000_backend_hardening_seed_contract.sql.
-- This migration is additive and preserves all legacy Safarnama columns/RPCs.

-- ---------------------------------------------------------------------------
-- Extensibility: metadata and optimistic concurrency
-- ---------------------------------------------------------------------------

-- Metadata gives the backend room for provider IDs, import/export annotations,
-- source attribution, and app-version-specific flags without schema churn.
alter table public.profiles add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.cities add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.trips add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.activities add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.itinerary_days add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.itinerary_items add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.expenses add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.packing_items add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.journal_entries add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.profiles drop constraint if exists profiles_metadata_object_check;
alter table public.profiles add constraint profiles_metadata_object_check
  check (jsonb_typeof(metadata) = 'object');
alter table public.cities drop constraint if exists cities_metadata_object_check;
alter table public.cities add constraint cities_metadata_object_check
  check (jsonb_typeof(metadata) = 'object');
alter table public.trips drop constraint if exists trips_metadata_object_check;
alter table public.trips add constraint trips_metadata_object_check
  check (jsonb_typeof(metadata) = 'object');
alter table public.activities drop constraint if exists activities_metadata_object_check;
alter table public.activities add constraint activities_metadata_object_check
  check (jsonb_typeof(metadata) = 'object');
alter table public.itinerary_days drop constraint if exists itinerary_days_metadata_object_check;
alter table public.itinerary_days add constraint itinerary_days_metadata_object_check
  check (jsonb_typeof(metadata) = 'object');
alter table public.itinerary_items drop constraint if exists itinerary_items_metadata_object_check;
alter table public.itinerary_items add constraint itinerary_items_metadata_object_check
  check (jsonb_typeof(metadata) = 'object');
alter table public.expenses drop constraint if exists expenses_metadata_object_check;
alter table public.expenses add constraint expenses_metadata_object_check
  check (jsonb_typeof(metadata) = 'object');
alter table public.packing_items drop constraint if exists packing_items_metadata_object_check;
alter table public.packing_items add constraint packing_items_metadata_object_check
  check (jsonb_typeof(metadata) = 'object');
alter table public.journal_entries drop constraint if exists journal_entries_metadata_object_check;
alter table public.journal_entries add constraint journal_entries_metadata_object_check
  check (jsonb_typeof(metadata) = 'object');

-- lock_version supports future optimistic concurrency checks from frontend
-- services without changing existing update APIs today.
alter table public.profiles add column if not exists lock_version integer not null default 0;
alter table public.cities add column if not exists lock_version integer not null default 0;
alter table public.trips add column if not exists lock_version integer not null default 0;
alter table public.activities add column if not exists lock_version integer not null default 0;
alter table public.itinerary_days add column if not exists lock_version integer not null default 0;
alter table public.itinerary_items add column if not exists lock_version integer not null default 0;
alter table public.expenses add column if not exists lock_version integer not null default 0;
alter table public.packing_items add column if not exists lock_version integer not null default 0;
alter table public.journal_entries add column if not exists lock_version integer not null default 0;

alter table public.profiles drop constraint if exists profiles_lock_version_check;
alter table public.profiles add constraint profiles_lock_version_check check (lock_version >= 0);
alter table public.cities drop constraint if exists cities_lock_version_check;
alter table public.cities add constraint cities_lock_version_check check (lock_version >= 0);
alter table public.trips drop constraint if exists trips_lock_version_check;
alter table public.trips add constraint trips_lock_version_check check (lock_version >= 0);
alter table public.activities drop constraint if exists activities_lock_version_check;
alter table public.activities add constraint activities_lock_version_check check (lock_version >= 0);
alter table public.itinerary_days drop constraint if exists itinerary_days_lock_version_check;
alter table public.itinerary_days add constraint itinerary_days_lock_version_check check (lock_version >= 0);
alter table public.itinerary_items drop constraint if exists itinerary_items_lock_version_check;
alter table public.itinerary_items add constraint itinerary_items_lock_version_check check (lock_version >= 0);
alter table public.expenses drop constraint if exists expenses_lock_version_check;
alter table public.expenses add constraint expenses_lock_version_check check (lock_version >= 0);
alter table public.packing_items drop constraint if exists packing_items_lock_version_check;
alter table public.packing_items add constraint packing_items_lock_version_check check (lock_version >= 0);
alter table public.journal_entries drop constraint if exists journal_entries_lock_version_check;
alter table public.journal_entries add constraint journal_entries_lock_version_check check (lock_version >= 0);

create or replace function public.increment_lock_version()
returns trigger
language plpgsql
as $$
begin
  new.lock_version := coalesce(old.lock_version, 0) + 1;
  return new;
end;
$$;

drop trigger if exists increment_profiles_lock_version on public.profiles;
create trigger increment_profiles_lock_version
before update on public.profiles
for each row execute function public.increment_lock_version();

drop trigger if exists increment_cities_lock_version on public.cities;
create trigger increment_cities_lock_version
before update on public.cities
for each row execute function public.increment_lock_version();

drop trigger if exists increment_trips_lock_version on public.trips;
create trigger increment_trips_lock_version
before update on public.trips
for each row execute function public.increment_lock_version();

drop trigger if exists increment_activities_lock_version on public.activities;
create trigger increment_activities_lock_version
before update on public.activities
for each row execute function public.increment_lock_version();

drop trigger if exists increment_itinerary_days_lock_version on public.itinerary_days;
create trigger increment_itinerary_days_lock_version
before update on public.itinerary_days
for each row execute function public.increment_lock_version();

drop trigger if exists increment_itinerary_items_lock_version on public.itinerary_items;
create trigger increment_itinerary_items_lock_version
before update on public.itinerary_items
for each row execute function public.increment_lock_version();

drop trigger if exists increment_expenses_lock_version on public.expenses;
create trigger increment_expenses_lock_version
before update on public.expenses
for each row execute function public.increment_lock_version();

drop trigger if exists increment_packing_items_lock_version on public.packing_items;
create trigger increment_packing_items_lock_version
before update on public.packing_items
for each row execute function public.increment_lock_version();

drop trigger if exists increment_journal_entries_lock_version on public.journal_entries;
create trigger increment_journal_entries_lock_version
before update on public.journal_entries
for each row execute function public.increment_lock_version();

-- ---------------------------------------------------------------------------
-- Data quality and validation
-- ---------------------------------------------------------------------------

update public.activities set currency = upper(currency) where currency is not null;
update public.itinerary_items set currency = upper(currency) where currency is not null;

alter table public.activities drop constraint if exists activities_currency_check;
alter table public.activities add constraint activities_currency_check
  check (currency ~ '^[A-Z]{3}$');

alter table public.itinerary_items drop constraint if exists itinerary_items_currency_check;
alter table public.itinerary_items add constraint itinerary_items_currency_check
  check (currency ~ '^[A-Z]{3}$');

-- Keep itinerary day dates inside the parent trip window when both dates exist.
-- This does not block draft trips that have no date range yet.
create or replace function public.validate_itinerary_day_date()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  trip_start date;
  trip_end date;
begin
  if new.date is null then
    return new;
  end if;

  select start_date, end_date
  into trip_start, trip_end
  from public.trips
  where id = new.trip_id;

  if trip_start is not null and new.date < trip_start then
    raise exception 'Itinerary day date cannot be before trip start_date' using errcode = '23514';
  end if;

  if trip_end is not null and new.date > trip_end then
    raise exception 'Itinerary day date cannot be after trip end_date' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_itinerary_day_date on public.itinerary_days;
create trigger validate_itinerary_day_date
before insert or update of trip_id, date on public.itinerary_days
for each row execute function public.validate_itinerary_day_date();

-- ---------------------------------------------------------------------------
-- Operational tables for auditability, observability, and seed tracking
-- ---------------------------------------------------------------------------

create table if not exists public.trip_activity_events (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references public.trips(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  entity_table text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.trip_activity_events drop constraint if exists trip_activity_events_event_type_check;
alter table public.trip_activity_events add constraint trip_activity_events_event_type_check
  check (event_type ~ '^[a-z][a-z0-9_:.]{1,79}$');
alter table public.trip_activity_events drop constraint if exists trip_activity_events_metadata_object_check;
alter table public.trip_activity_events add constraint trip_activity_events_metadata_object_check
  check (jsonb_typeof(metadata) = 'object');

alter table public.trip_activity_events enable row level security;

drop policy if exists trip_activity_events_select_owner_or_admin on public.trip_activity_events;
create policy trip_activity_events_select_owner_or_admin on public.trip_activity_events
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.trips t
    where t.id = trip_activity_events.trip_id
      and t.user_id = auth.uid()
  )
);

create index if not exists trip_activity_events_trip_created_idx
  on public.trip_activity_events(trip_id, created_at desc);
create index if not exists trip_activity_events_actor_created_idx
  on public.trip_activity_events(actor_user_id, created_at desc);
create index if not exists trip_activity_events_type_idx
  on public.trip_activity_events(event_type);

create or replace function public.record_trip_activity_event(
  p_trip_id uuid,
  p_event_type text,
  p_entity_table text default null,
  p_entity_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id uuid;
begin
  if p_trip_id is null then
    raise exception 'p_trip_id is required' using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_metadata, '{}'::jsonb)) <> 'object' then
    raise exception 'p_metadata must be a JSON object' using errcode = '22023';
  end if;

  if not public.is_admin()
    and not public.is_service_role()
    and not exists (
      select 1
      from public.trips t
      where t.id = p_trip_id
        and t.user_id = auth.uid()
    ) then
    raise exception 'Trip access denied for activity event' using errcode = '42501';
  end if;

  insert into public.trip_activity_events (
    trip_id,
    actor_user_id,
    event_type,
    entity_table,
    entity_id,
    metadata
  )
  values (
    p_trip_id,
    auth.uid(),
    p_event_type,
    p_entity_table,
    p_entity_id,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into inserted_id;

  return inserted_id;
end;
$$;

create table if not exists public.public_share_access_events (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references public.trips(id) on delete cascade,
  share_id text not null,
  accessed_at timestamptz not null default timezone('utc'::text, now()),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.public_share_access_events drop constraint if exists public_share_access_events_metadata_object_check;
alter table public.public_share_access_events add constraint public_share_access_events_metadata_object_check
  check (jsonb_typeof(metadata) = 'object');

alter table public.public_share_access_events enable row level security;

drop policy if exists public_share_access_events_admin_select on public.public_share_access_events;
create policy public_share_access_events_admin_select on public.public_share_access_events
for select to authenticated
using (public.is_admin());

create index if not exists public_share_access_events_trip_accessed_idx
  on public.public_share_access_events(trip_id, accessed_at desc);
create index if not exists public_share_access_events_share_accessed_idx
  on public.public_share_access_events(share_id, accessed_at desc);

create table if not exists public.seed_runs (
  id uuid primary key default uuid_generate_v4(),
  seed_name text not null unique,
  checksum text,
  applied_at timestamptz not null default timezone('utc'::text, now()),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.seed_runs drop constraint if exists seed_runs_metadata_object_check;
alter table public.seed_runs add constraint seed_runs_metadata_object_check
  check (jsonb_typeof(metadata) = 'object');

alter table public.seed_runs enable row level security;

drop policy if exists seed_runs_admin_select on public.seed_runs;
create policy seed_runs_admin_select on public.seed_runs
for select to authenticated
using (public.is_admin());

create index if not exists seed_runs_applied_at_idx on public.seed_runs(applied_at desc);

-- ---------------------------------------------------------------------------
-- Analytics RPC refresh: still aggregate-only, now includes operational counts.
-- ---------------------------------------------------------------------------

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
      'public_share_views', (
        select count(*)
        from public.public_share_access_events e
        where e.accessed_at >= v_from and e.accessed_at < v_to
      ),
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
      ),
      'trip_activity_events', (
        select count(*) from public.trip_activity_events
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
    ), '[]'::jsonb),
    'daily_public_share_views', coalesce((
      select jsonb_agg(
        jsonb_build_object('date', day, 'count', count)
        order by day
      )
      from (
        select accessed_at::date as day, count(*)::integer as count
        from public.public_share_access_events
        where accessed_at >= v_from and accessed_at < v_to
        group by accessed_at::date
        order by accessed_at::date
      ) d
    ), '[]'::jsonb)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants and comments
-- ---------------------------------------------------------------------------

revoke execute on function public.increment_lock_version() from public;
revoke execute on function public.validate_itinerary_day_date() from public;
revoke execute on function public.record_trip_activity_event(uuid, text, text, uuid, jsonb) from public;

grant execute on function public.record_trip_activity_event(uuid, text, text, uuid, jsonb) to authenticated;
grant execute on function public.get_admin_analytics(date, date) to authenticated;

comment on column public.trips.metadata is
  'JSON object for forward-compatible app/import/export metadata. Never store secrets here.';
comment on column public.trips.lock_version is
  'Optimistic concurrency counter incremented by trigger on every update.';
comment on table public.trip_activity_events is
  'Append-only trip audit/event log for future collaboration, import/export, and admin support workflows.';
comment on table public.public_share_access_events is
  'Operational event table for public share analytics. Admin-readable only.';
comment on table public.seed_runs is
  'Tracks seed batches applied to the database.';
comment on function public.record_trip_activity_event(uuid, text, text, uuid, jsonb) is
  'Records an owner/admin-authorized trip activity event and returns its UUID.';

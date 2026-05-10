-- Traveloop / Safarnama backend hardening and seed contract
-- Run after 20260510000000_phase0_backend_contract.sql.
-- This migration is additive and compatibility-preserving: it does not rename or remove
-- legacy Safarnama columns used by the existing profiles/trips/expenses frontend.

-- ---------------------------------------------------------------------------
-- PHASE 1/2: schema compatibility, constraints, indexes, and comments
-- ---------------------------------------------------------------------------

-- Legacy Safarnama used planning/in_progress/completed. The pulled frontend shell
-- uses draft/planned/active/completed/archived. Keep both families valid so old
-- clients and new clients can coexist during migration.
alter table public.trips drop constraint if exists trips_status_check;
alter table public.trips add constraint trips_status_check
  check (status in (
    'planning',
    'in_progress',
    'completed',
    'draft',
    'planned',
    'active',
    'archived'
  ));

-- Keep legacy trip fields present, but make them safe for newer trip creation flows
-- that provide title/start_date/end_date instead of legacy date/time.
alter table public.trips alter column origin set default '';
alter table public.trips alter column destination set default '';
alter table public.trips alter column travel_mode set default 'other';
alter table public.trips alter column date drop not null;
alter table public.trips alter column time drop not null;

-- Public shares must have a stable token whenever sharing is enabled.
alter table public.trips drop constraint if exists trips_public_share_id_required_check;
alter table public.trips add constraint trips_public_share_id_required_check
  check (not is_public or share_id is not null);

alter table public.trips drop constraint if exists trips_share_id_format_check;
alter table public.trips add constraint trips_share_id_format_check
  check (share_id is null or share_id ~ '^[A-Za-z0-9_-]{8,64}$');

-- Natural identity indexes for seed catalogs. These make seed scripts idempotent
-- and protect search quality from accidental duplicate seed rows.
create unique index if not exists cities_seed_identity_unique_idx
  on public.cities (lower(name), coalesce(lower(region), ''), lower(country));

create unique index if not exists activities_seed_identity_unique_idx
  on public.activities (city_id, lower(name), lower(source))
  where is_seed;

-- Additional indexes for ownership checks, filtering, public share loading, and analytics.
create index if not exists trips_user_status_dates_idx
  on public.trips(user_id, status, start_date, end_date);

create index if not exists trips_public_active_share_idx
  on public.trips(share_id)
  where is_public = true and share_id is not null;

create index if not exists activities_city_category_rating_idx
  on public.activities(city_id, category, rating desc nulls last);

create index if not exists itinerary_items_day_time_sort_idx
  on public.itinerary_items(day_id, start_time, sort_order);

create index if not exists expenses_trip_category_created_idx
  on public.expenses(trip_id, category, created_at);

create index if not exists journal_entries_trip_public_date_idx
  on public.journal_entries(trip_id, is_public, entry_date);

comment on table public.profiles is
  'Safarnama user profiles. Contains private profile data and a guarded user/admin role.';
comment on table public.trips is
  'Owner-scoped trips. Preserves legacy Safarnama fields and adds itinerary/public sharing fields.';
comment on table public.expenses is
  'Owner-scoped trip expenses. Private by default and optionally linked to itinerary items.';
comment on table public.cities is
  'Public city catalog used by city search and trip primary city selection.';
comment on table public.activities is
  'Seed and user-created activity catalog used by itinerary search.';
comment on table public.itinerary_days is
  'Trip-owned day records for day-wise itinerary views.';
comment on table public.itinerary_items is
  'Trip-owned itinerary item records linked to a day and optional activity.';
comment on table public.packing_items is
  'Trip-owned packing checklist records.';
comment on table public.journal_entries is
  'Trip-owned journal entries. Public sharing requires both trip and entry approval.';

comment on column public.trips.share_id is
  'Opaque public token used by /share/:shareId. Never exposes user_id.';
comment on column public.trips.public_show_expenses is
  'Owner approval flag. Expenses are never included in public payloads unless true.';
comment on column public.journal_entries.is_public is
  'Entry-level approval flag. Public journal payloads require this and trip public_show_journal.';

-- ---------------------------------------------------------------------------
-- PHASE 3/6: backend security hardening
-- ---------------------------------------------------------------------------

-- Generate unique share IDs with a collision-safe loop.
create or replace function public.ensure_trip_share_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate_share_id text;
begin
  if new.is_public and (new.share_id is null or btrim(new.share_id) = '') then
    loop
      candidate_share_id := encode(gen_random_bytes(9), 'hex');
      exit when not exists (
        select 1
        from public.trips t
        where t.share_id = candidate_share_id
      );
    end loop;

    new.share_id := candidate_share_id;
    new.share_enabled_at := coalesce(new.share_enabled_at, timezone('utc'::text, now()));
  end if;

  if tg_op = 'UPDATE' then
    if new.is_public and old.is_public is distinct from new.is_public then
      new.share_enabled_at := coalesce(new.share_enabled_at, timezone('utc'::text, now()));
    end if;
  end if;

  return new;
end;
$$;

-- Prevent a user from attaching a private activity owned by another user to an
-- itinerary item. Otherwise a guessed activity UUID could leak through the public
-- itinerary RPC, which intentionally runs as SECURITY DEFINER.
create or replace function public.validate_itinerary_item_links()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_day_city_id uuid;
  linked_activity_city_id uuid;
  linked_activity_is_seed boolean;
  linked_activity_owner uuid;
begin
  select city_id
  into linked_day_city_id
  from public.itinerary_days d
  where d.id = new.day_id
    and d.trip_id = new.trip_id;

  if not found then
    raise exception 'Itinerary item day must belong to the same trip' using errcode = '23514';
  end if;

  if new.activity_id is not null then
    select city_id, is_seed, created_by
    into linked_activity_city_id, linked_activity_is_seed, linked_activity_owner
    from public.activities
    where id = new.activity_id;

    if not found then
      raise exception 'Activity not found for itinerary item' using errcode = '23503';
    end if;

    if not linked_activity_is_seed
      and linked_activity_owner is distinct from auth.uid()
      and not public.is_admin()
      and not public.is_service_role() then
      raise exception 'Cannot attach another user''s private activity' using errcode = '42501';
    end if;

    if new.city_id is null and linked_activity_city_id is not null then
      new.city_id := linked_activity_city_id;
    end if;
  end if;

  if new.city_id is null and linked_day_city_id is not null then
    new.city_id := linked_day_city_id;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_itinerary_item_links on public.itinerary_items;
create trigger validate_itinerary_item_links
before insert or update of trip_id, day_id, activity_id, city_id on public.itinerary_items
for each row execute function public.validate_itinerary_item_links();

-- Restrict direct execution of internal trigger helpers. RLS policies and triggers
-- still call them; clients should use table operations or the public RPCs below.
revoke execute on function public.update_updated_at_column() from public;
revoke execute on function public.is_service_role() from public;
revoke execute on function public.enforce_profile_role_guard() from public;
revoke execute on function public.assign_trip_number() from public;
revoke execute on function public.ensure_trip_share_id() from public;
revoke execute on function public.set_city_search_text() from public;
revoke execute on function public.set_activity_search_text() from public;
revoke execute on function public.set_activity_owner() from public;
revoke execute on function public.set_expense_owner() from public;
revoke execute on function public.update_trip_total_expenses() from public;
revoke execute on function public.validate_journal_links() from public;
revoke execute on function public.validate_itinerary_item_links() from public;

grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- PHASE 4: RPC comments and explicit grants
-- ---------------------------------------------------------------------------

comment on function public.generate_trip_number(uuid) is
  'Returns the next Safarnama-compatible trip number for an authenticated user, e.g. TR001.';
comment on function public.search_cities(text, integer) is
  'Searches the public city catalog with trigram-backed search_text.';
comment on function public.search_activities(uuid, text, text, integer) is
  'Searches seed activities and the caller-owned activity catalog, optionally scoped by city/category.';
comment on function public.load_public_itinerary(text) is
  'Loads only owner-approved public itinerary payloads for /share/:shareId. Never returns profile data.';
comment on function public.get_admin_analytics(date, date) is
  'Returns aggregate-only analytics for authenticated users whose profile role is admin.';

revoke execute on function public.search_cities(text, integer) from public;
revoke execute on function public.search_activities(uuid, text, text, integer) from public;
revoke execute on function public.load_public_itinerary(text) from public;
revoke execute on function public.get_admin_analytics(date, date) from public;
revoke execute on function public.generate_trip_number(uuid) from public;

grant execute on function public.search_cities(text, integer) to anon, authenticated;
grant execute on function public.search_activities(uuid, text, text, integer) to anon, authenticated;
grant execute on function public.load_public_itinerary(text) to anon, authenticated;
grant execute on function public.get_admin_analytics(date, date) to authenticated;
grant execute on function public.generate_trip_number(uuid) to authenticated;

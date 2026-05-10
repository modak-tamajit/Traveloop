-- Rollback companion for 20260510010000_backend_hardening_seed_contract.sql.
-- This rollback removes only the additive hardening artifacts from that migration.
-- It intentionally does not drop data tables or legacy Safarnama columns.

drop trigger if exists validate_itinerary_item_links on public.itinerary_items;
drop function if exists public.validate_itinerary_item_links();

drop index if exists public.journal_entries_trip_public_date_idx;
drop index if exists public.expenses_trip_category_created_idx;
drop index if exists public.itinerary_items_day_time_sort_idx;
drop index if exists public.activities_city_category_rating_idx;
drop index if exists public.trips_public_active_share_idx;
drop index if exists public.trips_user_status_dates_idx;
drop index if exists public.activities_seed_identity_unique_idx;
drop index if exists public.cities_seed_identity_unique_idx;

alter table public.trips drop constraint if exists trips_share_id_format_check;
alter table public.trips drop constraint if exists trips_public_share_id_required_check;

-- Restore the Phase 0 legacy status constraint. This may fail if newer status
-- values already exist; normalize those rows first if a full rollback is needed.
alter table public.trips drop constraint if exists trips_status_check;
alter table public.trips add constraint trips_status_check
  check (status in ('planning', 'in_progress', 'completed'));

comment on table public.profiles is null;
comment on table public.trips is null;
comment on table public.expenses is null;
comment on table public.cities is null;
comment on table public.activities is null;
comment on table public.itinerary_days is null;
comment on table public.itinerary_items is null;
comment on table public.packing_items is null;
comment on table public.journal_entries is null;
comment on column public.trips.share_id is null;
comment on column public.trips.public_show_expenses is null;
comment on column public.journal_entries.is_public is null;
comment on function public.generate_trip_number(uuid) is null;
comment on function public.search_cities(text, integer) is null;
comment on function public.search_activities(uuid, text, text, integer) is null;
comment on function public.load_public_itinerary(text) is null;
comment on function public.get_admin_analytics(date, date) is null;

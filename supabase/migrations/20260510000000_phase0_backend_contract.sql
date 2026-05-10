-- Traveloop / Safarnama Phase 0 backend contract
-- Role 3: Backend/Supabase
-- Keeps compatibility with existing Safarnama profiles, trips, and expenses tables.

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create or replace function public.is_service_role()
returns boolean
language sql
stable
as $$
  select coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role';
$$;

-- Profiles: existing Safarnama profile columns plus role.
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  date_of_birth date,
  phone text,
  address text,
  bio text,
  profile_picture_url text,
  role text not null default 'user',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles add column if not exists role text default 'user';
update public.profiles set role = 'user' where role is null;
alter table public.profiles alter column role set default 'user';
alter table public.profiles alter column role set not null;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.enforce_profile_role_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_service_role() or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' and coalesce(new.role, 'user') <> 'user' and not public.is_admin() then
    raise exception 'Only admins can create admin profiles' using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' then
    if new.role is distinct from old.role and not public.is_admin() then
      raise exception 'Only admins can change profile roles' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

drop trigger if exists enforce_profile_role_guard on public.profiles;
create trigger enforce_profile_role_guard
before insert or update on public.profiles
for each row execute function public.enforce_profile_role_guard();

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can delete own profile" on public.profiles;
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;

create policy profiles_select_own on public.profiles
for select to authenticated
using (auth.uid() = user_id);

create policy profiles_insert_own on public.profiles
for insert to authenticated
with check (auth.uid() = user_id);

create policy profiles_update_own on public.profiles
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy profiles_delete_own on public.profiles
for delete to authenticated
using (auth.uid() = user_id);

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_role_idx on public.profiles(role);

-- Public catalog: cities.
create table if not exists public.cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  region text,
  country text not null,
  country_code text,
  lat numeric(9, 6),
  lng numeric(9, 6),
  timezone text,
  image_url text,
  search_text text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.cities add column if not exists search_text text;

alter table public.cities drop constraint if exists cities_country_code_check;
alter table public.cities add constraint cities_country_code_check
  check (country_code is null or char_length(country_code) between 2 and 3);
alter table public.cities drop constraint if exists cities_lat_check;
alter table public.cities add constraint cities_lat_check
  check (lat is null or lat between -90 and 90);
alter table public.cities drop constraint if exists cities_lng_check;
alter table public.cities add constraint cities_lng_check
  check (lng is null or lng between -180 and 180);

create or replace function public.set_city_search_text()
returns trigger
language plpgsql
as $$
begin
  new.search_text := lower(concat_ws(' ', new.name, new.region, new.country, new.country_code));
  return new;
end;
$$;

drop trigger if exists set_city_search_text on public.cities;
create trigger set_city_search_text
before insert or update of name, region, country, country_code on public.cities
for each row execute function public.set_city_search_text();

drop trigger if exists update_cities_updated_at on public.cities;
create trigger update_cities_updated_at
before update on public.cities
for each row execute function public.update_updated_at_column();

update public.cities
set search_text = lower(concat_ws(' ', name, region, country, country_code))
where search_text is null;

alter table public.cities enable row level security;

drop policy if exists cities_read_all on public.cities;
drop policy if exists cities_admin_insert on public.cities;
drop policy if exists cities_admin_update on public.cities;
drop policy if exists cities_admin_delete on public.cities;

create policy cities_read_all on public.cities
for select to anon, authenticated
using (true);

create policy cities_admin_insert on public.cities
for insert to authenticated
with check (public.is_admin());

create policy cities_admin_update on public.cities
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy cities_admin_delete on public.cities
for delete to authenticated
using (public.is_admin());

create index if not exists cities_name_idx on public.cities(name);
create index if not exists cities_country_idx on public.cities(country, region);
create index if not exists cities_search_text_trgm_idx on public.cities using gin(search_text gin_trgm_ops);

-- Trips: existing Safarnama columns plus title, date range, primary city, public sharing, and visibility toggles.
create table if not exists public.trips (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_number text not null,
  origin text not null default '',
  destination text not null default '',
  travel_mode text not null default 'other',
  date text,
  time text,
  title text not null default 'Untitled trip',
  start_date date,
  end_date date,
  primary_city_id uuid references public.cities(id) on delete set null,
  notes text,
  travelers text[] default '{}',
  total_expenses numeric(12, 2) not null default 0,
  status text not null default 'planning',
  is_public boolean not null default false,
  share_id text,
  share_enabled_at timestamptz,
  share_expires_at timestamptz,
  public_show_overview boolean not null default true,
  public_show_itinerary boolean not null default true,
  public_show_expenses boolean not null default false,
  public_show_packing boolean not null default false,
  public_show_journal boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.trips add column if not exists title text default 'Untitled trip';
alter table public.trips add column if not exists start_date date;
alter table public.trips add column if not exists end_date date;
alter table public.trips add column if not exists primary_city_id uuid references public.cities(id) on delete set null;
alter table public.trips add column if not exists is_public boolean default false;
alter table public.trips add column if not exists share_id text;
alter table public.trips add column if not exists share_enabled_at timestamptz;
alter table public.trips add column if not exists share_expires_at timestamptz;
alter table public.trips add column if not exists public_show_overview boolean default true;
alter table public.trips add column if not exists public_show_itinerary boolean default true;
alter table public.trips add column if not exists public_show_expenses boolean default false;
alter table public.trips add column if not exists public_show_packing boolean default false;
alter table public.trips add column if not exists public_show_journal boolean default false;

update public.trips set title = coalesce(nullif(title, ''), destination, 'Untitled trip') where title is null or title = '';
update public.trips set is_public = false where is_public is null;
update public.trips set public_show_overview = true where public_show_overview is null;
update public.trips set public_show_itinerary = true where public_show_itinerary is null;
update public.trips set public_show_expenses = false where public_show_expenses is null;
update public.trips set public_show_packing = false where public_show_packing is null;
update public.trips set public_show_journal = false where public_show_journal is null;

alter table public.trips alter column title set default 'Untitled trip';
alter table public.trips alter column title set not null;
alter table public.trips alter column is_public set default false;
alter table public.trips alter column is_public set not null;
alter table public.trips alter column public_show_overview set default true;
alter table public.trips alter column public_show_overview set not null;
alter table public.trips alter column public_show_itinerary set default true;
alter table public.trips alter column public_show_itinerary set not null;
alter table public.trips alter column public_show_expenses set default false;
alter table public.trips alter column public_show_expenses set not null;
alter table public.trips alter column public_show_packing set default false;
alter table public.trips alter column public_show_packing set not null;
alter table public.trips alter column public_show_journal set default false;
alter table public.trips alter column public_show_journal set not null;

alter table public.trips drop constraint if exists trips_status_check;
alter table public.trips add constraint trips_status_check
  check (status in ('planning', 'in_progress', 'completed'));
alter table public.trips drop constraint if exists trips_date_range_check;
alter table public.trips add constraint trips_date_range_check
  check (start_date is null or end_date is null or start_date <= end_date);
alter table public.trips drop constraint if exists trips_total_expenses_check;
alter table public.trips add constraint trips_total_expenses_check
  check (total_expenses >= 0);

create unique index if not exists trips_user_trip_number_unique_idx
  on public.trips(user_id, trip_number);
create unique index if not exists trips_share_id_unique_idx
  on public.trips(share_id)
  where share_id is not null;

create table if not exists public.trip_number_counters (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_number integer not null default 0,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.trip_number_counters enable row level security;
drop policy if exists trip_number_counters_select_own on public.trip_number_counters;
create policy trip_number_counters_select_own on public.trip_number_counters
for select to authenticated
using (auth.uid() = user_id);

create or replace function public.generate_trip_number(user_uuid uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_number integer;
begin
  if user_uuid is null then
    raise exception 'user_uuid is required' using errcode = '22023';
  end if;

  if auth.uid() is not null and auth.uid() <> user_uuid and not public.is_admin() then
    raise exception 'Cannot generate trip numbers for another user' using errcode = '42501';
  end if;

  insert into public.trip_number_counters(user_id, last_number)
  values (
    user_uuid,
    coalesce((
      select max(nullif(regexp_replace(trip_number, '\D', '', 'g'), '')::integer)
      from public.trips
      where user_id = user_uuid
    ), 0) + 1
  )
  on conflict (user_id) do update
    set last_number = greatest(public.trip_number_counters.last_number + 1, excluded.last_number),
        updated_at = timezone('utc'::text, now())
  returning last_number into next_number;

  return 'TR' || lpad(next_number::text, 3, '0');
end;
$$;

create or replace function public.assign_trip_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.trip_number is null or btrim(new.trip_number) = '' then
    new.trip_number := public.generate_trip_number(new.user_id);
  end if;

  return new;
end;
$$;

create or replace function public.ensure_trip_share_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_public and (new.share_id is null or btrim(new.share_id) = '') then
    new.share_id := encode(gen_random_bytes(9), 'hex');
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

drop trigger if exists assign_trip_number on public.trips;
create trigger assign_trip_number
before insert on public.trips
for each row execute function public.assign_trip_number();

drop trigger if exists ensure_trip_share_id on public.trips;
create trigger ensure_trip_share_id
before insert or update of is_public, share_id on public.trips
for each row execute function public.ensure_trip_share_id();

drop trigger if exists update_trips_updated_at on public.trips;
create trigger update_trips_updated_at
before update on public.trips
for each row execute function public.update_updated_at_column();

alter table public.trips enable row level security;

drop policy if exists "Users can view own trips" on public.trips;
drop policy if exists "Users can insert own trips" on public.trips;
drop policy if exists "Users can update own trips" on public.trips;
drop policy if exists "Users can delete own trips" on public.trips;
drop policy if exists trips_select_own on public.trips;
drop policy if exists trips_insert_own on public.trips;
drop policy if exists trips_update_own on public.trips;
drop policy if exists trips_delete_own on public.trips;

create policy trips_select_own on public.trips
for select to authenticated
using (auth.uid() = user_id);

create policy trips_insert_own on public.trips
for insert to authenticated
with check (auth.uid() = user_id);

create policy trips_update_own on public.trips
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy trips_delete_own on public.trips
for delete to authenticated
using (auth.uid() = user_id);

create index if not exists trips_user_id_idx on public.trips(user_id);
create index if not exists trips_status_idx on public.trips(status);
create index if not exists trips_created_at_idx on public.trips(created_at);
create index if not exists trips_start_end_date_idx on public.trips(start_date, end_date);
create index if not exists trips_primary_city_id_idx on public.trips(primary_city_id);
create index if not exists trips_public_lookup_idx on public.trips(share_id, is_public)
  where share_id is not null;

-- Activities: seed catalog plus user-created suggestions.
create table if not exists public.activities (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid references public.cities(id) on delete set null,
  name text not null,
  category text not null default 'sightseeing',
  description text,
  duration_minutes integer,
  estimated_cost numeric(12, 2),
  currency text not null default 'INR',
  rating numeric(3, 2),
  location jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  source text not null default 'manual',
  created_by uuid references auth.users(id) on delete set null,
  is_seed boolean not null default false,
  search_text text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.activities add column if not exists search_text text;

alter table public.activities drop constraint if exists activities_duration_minutes_check;
alter table public.activities add constraint activities_duration_minutes_check
  check (duration_minutes is null or duration_minutes > 0);
alter table public.activities drop constraint if exists activities_estimated_cost_check;
alter table public.activities add constraint activities_estimated_cost_check
  check (estimated_cost is null or estimated_cost >= 0);
alter table public.activities drop constraint if exists activities_rating_check;
alter table public.activities add constraint activities_rating_check
  check (rating is null or rating between 0 and 5);
alter table public.activities drop constraint if exists activities_currency_check;
alter table public.activities add constraint activities_currency_check
  check (char_length(currency) = 3);

create or replace function public.set_activity_search_text()
returns trigger
language plpgsql
as $$
begin
  new.search_text := lower(concat_ws(
    ' ',
    new.name,
    new.category,
    new.description,
    array_to_string(new.tags, ' '),
    new.source
  ));
  return new;
end;
$$;

create or replace function public.set_activity_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null and auth.uid() is not null then
    new.created_by := auth.uid();
  end if;

  return new;
end;
$$;

drop trigger if exists set_activity_owner on public.activities;
create trigger set_activity_owner
before insert on public.activities
for each row execute function public.set_activity_owner();

drop trigger if exists set_activity_search_text on public.activities;
create trigger set_activity_search_text
before insert or update of name, category, description, tags, source on public.activities
for each row execute function public.set_activity_search_text();

drop trigger if exists update_activities_updated_at on public.activities;
create trigger update_activities_updated_at
before update on public.activities
for each row execute function public.update_updated_at_column();

update public.activities
set search_text = lower(concat_ws(' ', name, category, description, array_to_string(tags, ' '), source))
where search_text is null;

alter table public.activities enable row level security;

drop policy if exists activities_select_seed_or_own on public.activities;
drop policy if exists activities_insert_own on public.activities;
drop policy if exists activities_update_own_or_admin on public.activities;
drop policy if exists activities_delete_own_or_admin on public.activities;

create policy activities_select_seed_or_own on public.activities
for select to anon, authenticated
using (is_seed or created_by = auth.uid() or public.is_admin());

create policy activities_insert_own on public.activities
for insert to authenticated
with check ((created_by = auth.uid() and not is_seed) or public.is_admin());

create policy activities_update_own_or_admin on public.activities
for update to authenticated
using ((created_by = auth.uid() and not is_seed) or public.is_admin())
with check ((created_by = auth.uid() and not is_seed) or public.is_admin());

create policy activities_delete_own_or_admin on public.activities
for delete to authenticated
using ((created_by = auth.uid() and not is_seed) or public.is_admin());

create index if not exists activities_city_id_idx on public.activities(city_id);
create index if not exists activities_category_idx on public.activities(category);
create index if not exists activities_created_by_idx on public.activities(created_by);
create index if not exists activities_is_seed_idx on public.activities(is_seed);
create index if not exists activities_tags_idx on public.activities using gin(tags);
create index if not exists activities_search_text_trgm_idx on public.activities using gin(search_text gin_trgm_ops);

-- Trip-owned itinerary days.
create table if not exists public.itinerary_days (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_number integer not null,
  date date,
  city_id uuid references public.cities(id) on delete set null,
  title text,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (trip_id, day_number),
  unique (id, trip_id)
);

alter table public.itinerary_days drop constraint if exists itinerary_days_day_number_check;
alter table public.itinerary_days add constraint itinerary_days_day_number_check check (day_number > 0);

drop trigger if exists update_itinerary_days_updated_at on public.itinerary_days;
create trigger update_itinerary_days_updated_at
before update on public.itinerary_days
for each row execute function public.update_updated_at_column();

alter table public.itinerary_days enable row level security;

drop policy if exists itinerary_days_select_own_trip on public.itinerary_days;
drop policy if exists itinerary_days_insert_own_trip on public.itinerary_days;
drop policy if exists itinerary_days_update_own_trip on public.itinerary_days;
drop policy if exists itinerary_days_delete_own_trip on public.itinerary_days;

create policy itinerary_days_select_own_trip on public.itinerary_days
for select to authenticated
using (exists (
  select 1 from public.trips t
  where t.id = itinerary_days.trip_id
    and t.user_id = auth.uid()
));

create policy itinerary_days_insert_own_trip on public.itinerary_days
for insert to authenticated
with check (exists (
  select 1 from public.trips t
  where t.id = itinerary_days.trip_id
    and t.user_id = auth.uid()
));

create policy itinerary_days_update_own_trip on public.itinerary_days
for update to authenticated
using (exists (
  select 1 from public.trips t
  where t.id = itinerary_days.trip_id
    and t.user_id = auth.uid()
))
with check (exists (
  select 1 from public.trips t
  where t.id = itinerary_days.trip_id
    and t.user_id = auth.uid()
));

create policy itinerary_days_delete_own_trip on public.itinerary_days
for delete to authenticated
using (exists (
  select 1 from public.trips t
  where t.id = itinerary_days.trip_id
    and t.user_id = auth.uid()
));

create index if not exists itinerary_days_trip_id_idx on public.itinerary_days(trip_id);
create index if not exists itinerary_days_date_idx on public.itinerary_days(date);
create index if not exists itinerary_days_city_id_idx on public.itinerary_days(city_id);
create index if not exists itinerary_days_sort_idx on public.itinerary_days(trip_id, sort_order, day_number);

-- Trip-owned itinerary items.
create table if not exists public.itinerary_items (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_id uuid not null,
  activity_id uuid references public.activities(id) on delete set null,
  city_id uuid references public.cities(id) on delete set null,
  title text not null,
  description text,
  start_time time,
  end_time time,
  location jsonb not null default '{}'::jsonb,
  estimated_cost numeric(12, 2),
  currency text not null default 'INR',
  booking_status text not null default 'planned',
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (id, trip_id),
  constraint itinerary_items_day_trip_fk foreign key (day_id, trip_id)
    references public.itinerary_days(id, trip_id) on delete cascade
);

alter table public.itinerary_items drop constraint if exists itinerary_items_cost_check;
alter table public.itinerary_items add constraint itinerary_items_cost_check
  check (estimated_cost is null or estimated_cost >= 0);
alter table public.itinerary_items drop constraint if exists itinerary_items_currency_check;
alter table public.itinerary_items add constraint itinerary_items_currency_check
  check (char_length(currency) = 3);
alter table public.itinerary_items drop constraint if exists itinerary_items_booking_status_check;
alter table public.itinerary_items add constraint itinerary_items_booking_status_check
  check (booking_status in ('idea', 'planned', 'booked', 'cancelled', 'completed'));
alter table public.itinerary_items drop constraint if exists itinerary_items_time_check;
alter table public.itinerary_items add constraint itinerary_items_time_check
  check (start_time is null or end_time is null or start_time <= end_time);

drop trigger if exists update_itinerary_items_updated_at on public.itinerary_items;
create trigger update_itinerary_items_updated_at
before update on public.itinerary_items
for each row execute function public.update_updated_at_column();

alter table public.itinerary_items enable row level security;

drop policy if exists itinerary_items_select_own_trip on public.itinerary_items;
drop policy if exists itinerary_items_insert_own_trip on public.itinerary_items;
drop policy if exists itinerary_items_update_own_trip on public.itinerary_items;
drop policy if exists itinerary_items_delete_own_trip on public.itinerary_items;

create policy itinerary_items_select_own_trip on public.itinerary_items
for select to authenticated
using (exists (
  select 1 from public.trips t
  where t.id = itinerary_items.trip_id
    and t.user_id = auth.uid()
));

create policy itinerary_items_insert_own_trip on public.itinerary_items
for insert to authenticated
with check (exists (
  select 1 from public.trips t
  where t.id = itinerary_items.trip_id
    and t.user_id = auth.uid()
));

create policy itinerary_items_update_own_trip on public.itinerary_items
for update to authenticated
using (exists (
  select 1 from public.trips t
  where t.id = itinerary_items.trip_id
    and t.user_id = auth.uid()
))
with check (exists (
  select 1 from public.trips t
  where t.id = itinerary_items.trip_id
    and t.user_id = auth.uid()
));

create policy itinerary_items_delete_own_trip on public.itinerary_items
for delete to authenticated
using (exists (
  select 1 from public.trips t
  where t.id = itinerary_items.trip_id
    and t.user_id = auth.uid()
));

create index if not exists itinerary_items_trip_id_idx on public.itinerary_items(trip_id);
create index if not exists itinerary_items_day_id_idx on public.itinerary_items(day_id);
create index if not exists itinerary_items_activity_id_idx on public.itinerary_items(activity_id);
create index if not exists itinerary_items_city_id_idx on public.itinerary_items(city_id);
create index if not exists itinerary_items_booking_status_idx on public.itinerary_items(booking_status);
create index if not exists itinerary_items_sort_idx on public.itinerary_items(trip_id, day_id, sort_order);

-- Expenses: existing Safarnama expense fields plus optional itinerary_item_id.
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  itinerary_item_id uuid references public.itinerary_items(id) on delete set null,
  description text not null,
  amount numeric(12, 2) not null,
  category text not null,
  date text not null,
  time text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.expenses add column if not exists itinerary_item_id uuid references public.itinerary_items(id) on delete set null;
alter table public.expenses drop constraint if exists expenses_category_check;
alter table public.expenses add constraint expenses_category_check
  check (category in ('transport', 'food', 'accommodation', 'entertainment', 'other'));
alter table public.expenses drop constraint if exists expenses_amount_check;
alter table public.expenses add constraint expenses_amount_check
  check (amount >= 0);

create or replace function public.set_expense_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  item_trip_id uuid;
begin
  select user_id into owner_id
  from public.trips
  where id = new.trip_id;

  if owner_id is null then
    raise exception 'Trip not found for expense' using errcode = '23503';
  end if;

  new.user_id := owner_id;

  if new.itinerary_item_id is not null then
    select trip_id into item_trip_id
    from public.itinerary_items
    where id = new.itinerary_item_id;

    if item_trip_id is distinct from new.trip_id then
      raise exception 'Expense itinerary item must belong to the same trip' using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.update_trip_total_expenses()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_trip_id uuid;
begin
  if tg_op = 'DELETE' then
    affected_trip_id := old.trip_id;
  else
    affected_trip_id := new.trip_id;
  end if;

  update public.trips
  set total_expenses = (
    select coalesce(sum(amount), 0)
    from public.expenses
    where trip_id = affected_trip_id
  )
  where id = affected_trip_id;

  if tg_op = 'UPDATE' then
    if old.trip_id is distinct from new.trip_id then
      update public.trips
      set total_expenses = (
        select coalesce(sum(amount), 0)
        from public.expenses
        where trip_id = old.trip_id
      )
      where id = old.trip_id;
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists set_expense_owner on public.expenses;
create trigger set_expense_owner
before insert or update of trip_id, itinerary_item_id on public.expenses
for each row execute function public.set_expense_owner();

drop trigger if exists update_expenses_updated_at on public.expenses;
create trigger update_expenses_updated_at
before update on public.expenses
for each row execute function public.update_updated_at_column();

drop trigger if exists update_trip_expenses_insert on public.expenses;
drop trigger if exists update_trip_expenses_update on public.expenses;
drop trigger if exists update_trip_expenses_delete on public.expenses;
create trigger update_trip_expenses_insert
after insert on public.expenses
for each row execute function public.update_trip_total_expenses();
create trigger update_trip_expenses_update
after update of amount, trip_id on public.expenses
for each row execute function public.update_trip_total_expenses();
create trigger update_trip_expenses_delete
after delete on public.expenses
for each row execute function public.update_trip_total_expenses();

alter table public.expenses enable row level security;

drop policy if exists "Users can view own expenses" on public.expenses;
drop policy if exists "Users can insert own expenses" on public.expenses;
drop policy if exists "Users can update own expenses" on public.expenses;
drop policy if exists "Users can delete own expenses" on public.expenses;
drop policy if exists expenses_select_own on public.expenses;
drop policy if exists expenses_insert_own_trip on public.expenses;
drop policy if exists expenses_update_own on public.expenses;
drop policy if exists expenses_delete_own on public.expenses;

create policy expenses_select_own on public.expenses
for select to authenticated
using (auth.uid() = user_id);

create policy expenses_insert_own_trip on public.expenses
for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.trips t
    where t.id = expenses.trip_id
      and t.user_id = auth.uid()
  )
);

create policy expenses_update_own on public.expenses
for update to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.trips t
    where t.id = expenses.trip_id
      and t.user_id = auth.uid()
  )
);

create policy expenses_delete_own on public.expenses
for delete to authenticated
using (auth.uid() = user_id);

create index if not exists expenses_trip_id_idx on public.expenses(trip_id);
create index if not exists expenses_user_id_idx on public.expenses(user_id);
create index if not exists expenses_category_idx on public.expenses(category);
create index if not exists expenses_itinerary_item_id_idx on public.expenses(itinerary_item_id);
create index if not exists expenses_created_at_idx on public.expenses(created_at);

-- Trip-owned packing checklist.
create table if not exists public.packing_items (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  category text not null default 'general',
  quantity integer not null default 1,
  is_packed boolean not null default false,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.packing_items drop constraint if exists packing_items_quantity_check;
alter table public.packing_items add constraint packing_items_quantity_check check (quantity > 0);

drop trigger if exists update_packing_items_updated_at on public.packing_items;
create trigger update_packing_items_updated_at
before update on public.packing_items
for each row execute function public.update_updated_at_column();

alter table public.packing_items enable row level security;

drop policy if exists packing_items_select_own_trip on public.packing_items;
drop policy if exists packing_items_insert_own_trip on public.packing_items;
drop policy if exists packing_items_update_own_trip on public.packing_items;
drop policy if exists packing_items_delete_own_trip on public.packing_items;

create policy packing_items_select_own_trip on public.packing_items
for select to authenticated
using (exists (
  select 1 from public.trips t
  where t.id = packing_items.trip_id
    and t.user_id = auth.uid()
));

create policy packing_items_insert_own_trip on public.packing_items
for insert to authenticated
with check (exists (
  select 1 from public.trips t
  where t.id = packing_items.trip_id
    and t.user_id = auth.uid()
));

create policy packing_items_update_own_trip on public.packing_items
for update to authenticated
using (exists (
  select 1 from public.trips t
  where t.id = packing_items.trip_id
    and t.user_id = auth.uid()
))
with check (exists (
  select 1 from public.trips t
  where t.id = packing_items.trip_id
    and t.user_id = auth.uid()
));

create policy packing_items_delete_own_trip on public.packing_items
for delete to authenticated
using (exists (
  select 1 from public.trips t
  where t.id = packing_items.trip_id
    and t.user_id = auth.uid()
));

create index if not exists packing_items_trip_id_idx on public.packing_items(trip_id);
create index if not exists packing_items_category_idx on public.packing_items(category);
create index if not exists packing_items_is_packed_idx on public.packing_items(is_packed);
create index if not exists packing_items_sort_idx on public.packing_items(trip_id, sort_order);

-- Trip-owned journal entries.
create table if not exists public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_id uuid references public.itinerary_days(id) on delete set null,
  itinerary_item_id uuid references public.itinerary_items(id) on delete set null,
  title text not null,
  body text,
  entry_date date not null default current_date,
  mood text,
  is_public boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create or replace function public.validate_journal_links()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_trip_id uuid;
begin
  if new.day_id is not null then
    select trip_id into linked_trip_id from public.itinerary_days where id = new.day_id;
    if linked_trip_id is distinct from new.trip_id then
      raise exception 'Journal day must belong to the same trip' using errcode = '23514';
    end if;
  end if;

  if new.itinerary_item_id is not null then
    select trip_id into linked_trip_id from public.itinerary_items where id = new.itinerary_item_id;
    if linked_trip_id is distinct from new.trip_id then
      raise exception 'Journal itinerary item must belong to the same trip' using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_journal_links on public.journal_entries;
create trigger validate_journal_links
before insert or update of trip_id, day_id, itinerary_item_id on public.journal_entries
for each row execute function public.validate_journal_links();

drop trigger if exists update_journal_entries_updated_at on public.journal_entries;
create trigger update_journal_entries_updated_at
before update on public.journal_entries
for each row execute function public.update_updated_at_column();

alter table public.journal_entries enable row level security;

drop policy if exists journal_entries_select_own_trip on public.journal_entries;
drop policy if exists journal_entries_insert_own_trip on public.journal_entries;
drop policy if exists journal_entries_update_own_trip on public.journal_entries;
drop policy if exists journal_entries_delete_own_trip on public.journal_entries;

create policy journal_entries_select_own_trip on public.journal_entries
for select to authenticated
using (exists (
  select 1 from public.trips t
  where t.id = journal_entries.trip_id
    and t.user_id = auth.uid()
));

create policy journal_entries_insert_own_trip on public.journal_entries
for insert to authenticated
with check (exists (
  select 1 from public.trips t
  where t.id = journal_entries.trip_id
    and t.user_id = auth.uid()
));

create policy journal_entries_update_own_trip on public.journal_entries
for update to authenticated
using (exists (
  select 1 from public.trips t
  where t.id = journal_entries.trip_id
    and t.user_id = auth.uid()
))
with check (exists (
  select 1 from public.trips t
  where t.id = journal_entries.trip_id
    and t.user_id = auth.uid()
));

create policy journal_entries_delete_own_trip on public.journal_entries
for delete to authenticated
using (exists (
  select 1 from public.trips t
  where t.id = journal_entries.trip_id
    and t.user_id = auth.uid()
));

create index if not exists journal_entries_trip_id_idx on public.journal_entries(trip_id);
create index if not exists journal_entries_day_id_idx on public.journal_entries(day_id);
create index if not exists journal_entries_itinerary_item_id_idx on public.journal_entries(itinerary_item_id);
create index if not exists journal_entries_entry_date_idx on public.journal_entries(entry_date);
create index if not exists journal_entries_is_public_idx on public.journal_entries(is_public);

-- Search RPCs.
create or replace function public.search_cities(
  p_query text,
  p_limit integer default 10
)
returns table (
  id uuid,
  name text,
  region text,
  country text,
  country_code text,
  lat numeric,
  lng numeric,
  timezone text,
  image_url text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    c.id,
    c.name,
    c.region,
    c.country,
    c.country_code,
    c.lat,
    c.lng,
    c.timezone,
    c.image_url
  from public.cities c
  where coalesce(btrim(p_query), '') = ''
     or c.search_text ilike '%' || lower(btrim(p_query)) || '%'
  order by
    case when lower(c.name) = lower(btrim(coalesce(p_query, ''))) then 0 else 1 end,
    similarity(c.search_text, lower(btrim(coalesce(p_query, '')))) desc,
    c.country,
    c.name
  limit least(greatest(coalesce(p_limit, 10), 1), 50);
$$;

create or replace function public.search_activities(
  p_city_id uuid default null,
  p_query text default null,
  p_category text default null,
  p_limit integer default 20
)
returns table (
  id uuid,
  city_id uuid,
  city_name text,
  name text,
  category text,
  description text,
  duration_minutes integer,
  estimated_cost numeric,
  currency text,
  rating numeric,
  location jsonb,
  tags text[],
  source text,
  is_seed boolean
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    a.id,
    a.city_id,
    c.name as city_name,
    a.name,
    a.category,
    a.description,
    a.duration_minutes,
    a.estimated_cost,
    a.currency,
    a.rating,
    a.location,
    a.tags,
    a.source,
    a.is_seed
  from public.activities a
  left join public.cities c on c.id = a.city_id
  where (p_city_id is null or a.city_id = p_city_id)
    and (coalesce(btrim(p_category), '') = '' or a.category = p_category)
    and (
      coalesce(btrim(p_query), '') = ''
      or a.search_text ilike '%' || lower(btrim(p_query)) || '%'
    )
  order by
    case when lower(a.name) = lower(btrim(coalesce(p_query, ''))) then 0 else 1 end,
    a.is_seed desc,
    similarity(a.search_text, lower(btrim(coalesce(p_query, '')))) desc,
    a.rating desc nulls last,
    a.name
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

-- Public itinerary RPC. This is the only public data access path for /share/:shareId.
create or replace function public.load_public_itinerary(p_share_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_trip public.trips%rowtype;
begin
  select *
  into v_trip
  from public.trips
  where share_id = p_share_id
    and is_public = true
    and (share_expires_at is null or share_expires_at > timezone('utc'::text, now()));

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'trip', jsonb_build_object(
      'share_id', v_trip.share_id,
      'title', v_trip.title,
      'origin', case when v_trip.public_show_overview then v_trip.origin else null end,
      'destination', v_trip.destination,
      'travel_mode', case when v_trip.public_show_overview then v_trip.travel_mode else null end,
      'start_date', v_trip.start_date,
      'end_date', v_trip.end_date,
      'status', v_trip.status,
      'notes', case when v_trip.public_show_overview then v_trip.notes else null end,
      'created_at', v_trip.created_at,
      'updated_at', v_trip.updated_at
    ),
    'primary_city', (
      select case when c.id is null then null else jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'region', c.region,
        'country', c.country,
        'country_code', c.country_code,
        'lat', c.lat,
        'lng', c.lng,
        'timezone', c.timezone,
        'image_url', c.image_url
      ) end
      from public.cities c
      where c.id = v_trip.primary_city_id
    ),
    'itinerary_days', case
      when v_trip.public_show_itinerary then coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', d.id,
            'day_number', d.day_number,
            'date', d.date,
            'title', d.title,
            'notes', d.notes,
            'sort_order', d.sort_order,
            'city', case when c.id is null then null else jsonb_build_object(
              'id', c.id,
              'name', c.name,
              'region', c.region,
              'country', c.country,
              'country_code', c.country_code,
              'timezone', c.timezone,
              'image_url', c.image_url
            ) end,
            'items', coalesce((
              select jsonb_agg(
                jsonb_build_object(
                  'id', i.id,
                  'activity_id', i.activity_id,
                  'city_id', i.city_id,
                  'title', i.title,
                  'description', i.description,
                  'start_time', i.start_time,
                  'end_time', i.end_time,
                  'location', i.location,
                  'estimated_cost', i.estimated_cost,
                  'currency', i.currency,
                  'booking_status', i.booking_status,
                  'notes', i.notes,
                  'sort_order', i.sort_order,
                  'activity', case when a.id is null then null else jsonb_build_object(
                    'name', a.name,
                    'category', a.category,
                    'description', a.description,
                    'duration_minutes', a.duration_minutes,
                    'rating', a.rating,
                    'tags', a.tags,
                    'source', a.source
                  ) end
                )
                order by i.sort_order, i.start_time nulls last, i.created_at
              )
              from public.itinerary_items i
              left join public.activities a on a.id = i.activity_id
              where i.day_id = d.id
                and i.trip_id = v_trip.id
            ), '[]'::jsonb)
          )
          order by d.sort_order, d.day_number
        )
        from public.itinerary_days d
        left join public.cities c on c.id = d.city_id
        where d.trip_id = v_trip.id
      ), '[]'::jsonb)
      else '[]'::jsonb
    end,
    'packing_items', case
      when v_trip.public_show_packing then coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'category', p.category,
            'quantity', p.quantity,
            'is_packed', p.is_packed,
            'notes', p.notes,
            'sort_order', p.sort_order
          )
          order by p.sort_order, p.created_at
        )
        from public.packing_items p
        where p.trip_id = v_trip.id
      ), '[]'::jsonb)
      else '[]'::jsonb
    end,
    'journal_entries', case
      when v_trip.public_show_journal then coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', j.id,
            'day_id', j.day_id,
            'itinerary_item_id', j.itinerary_item_id,
            'title', j.title,
            'body', j.body,
            'entry_date', j.entry_date,
            'mood', j.mood
          )
          order by j.entry_date, j.created_at
        )
        from public.journal_entries j
        where j.trip_id = v_trip.id
          and j.is_public = true
      ), '[]'::jsonb)
      else '[]'::jsonb
    end,
    'expenses', case
      when v_trip.public_show_expenses then coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', e.id,
            'itinerary_item_id', e.itinerary_item_id,
            'description', e.description,
            'amount', e.amount,
            'category', e.category,
            'date', e.date,
            'time', e.time
          )
          order by e.date, e.time, e.created_at
        )
        from public.expenses e
        where e.trip_id = v_trip.id
      ), '[]'::jsonb)
      else '[]'::jsonb
    end,
    'visibility', jsonb_build_object(
      'overview', v_trip.public_show_overview,
      'itinerary', v_trip.public_show_itinerary,
      'expenses', v_trip.public_show_expenses,
      'packing', v_trip.public_show_packing,
      'journal', v_trip.public_show_journal
    )
  );
end;
$$;

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

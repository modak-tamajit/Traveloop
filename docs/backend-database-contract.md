# Traveloop Backend/Supabase Contract

Role: Developer 3 - Backend/Supabase  
Phase: 0 - Baseline Setup And Agreement

This contract keeps the existing Safarnama backend surface intact for `profiles`, `trips`, and `expenses`, then adds schema support for itinerary planning, search catalogs, packing, journal, public sharing, and admin analytics.

## Compatibility Baseline

- `profiles` keeps `id`, `user_id`, name fields, date of birth, phone, address, bio, profile picture URL, timestamps, and adds `role`.
- `trips` keeps `trip_number`, `origin`, `destination`, `travel_mode`, legacy `date`, legacy `time`, `notes`, `travelers`, `total_expenses`, `status`, and timestamps.
- `expenses` keeps `trip_id`, `user_id`, `description`, `amount`, `category`, legacy `date`, legacy `time`, and timestamps.
- Existing `generate_trip_number(user_uuid uuid)` remains available for the current Safarnama service code.
- Trip status keeps legacy values (`planning`, `in_progress`, `completed`) and also accepts the pulled frontend shell values (`draft`, `planned`, `active`, `archived`).

## Tables

### profiles

Owner table keyed by `user_id`.

- `id uuid primary key`
- `user_id uuid unique references auth.users(id) on delete cascade`
- `first_name text`
- `last_name text`
- `date_of_birth date`
- `phone text`
- `address text`
- `bio text`
- `profile_picture_url text`
- `role text check ('user', 'admin') default 'user'`
- `metadata jsonb`
- `lock_version integer`
- `created_at timestamptz`
- `updated_at timestamptz`

Role escalation is blocked from the client. Admin role assignment must be done by an existing admin or service-role migration/admin process.

### cities

Public searchable catalog.

- `id uuid primary key`
- `name text`
- `region text`
- `country text`
- `country_code text`
- `lat numeric`
- `lng numeric`
- `timezone text`
- `image_url text`
- `search_text text`
- `metadata jsonb`
- `lock_version integer`
- `created_at timestamptz`
- `updated_at timestamptz`

### trips

Owner table and parent for all trip-owned features.

- Existing Safarnama columns: `id`, `user_id`, `trip_number`, `origin`, `destination`, `travel_mode`, `date`, `time`, `notes`, `travelers`, `total_expenses`, `status`, `created_at`, `updated_at`
- New columns: `title`, `start_date`, `end_date`, `primary_city_id`
- Sharing columns: `is_public`, `share_id`, `share_enabled_at`, `share_expires_at`
- Visibility toggles: `public_show_overview`, `public_show_itinerary`, `public_show_expenses`, `public_show_packing`, `public_show_journal`
- Valid `status` values: `planning`, `in_progress`, `completed`, `draft`, `planned`, `active`, `archived`
- Production columns: `metadata jsonb`, `lock_version integer`

Frontend routes use `share_id` for `/share/:shareId`.

### activities

Searchable activity catalog with seed and user-created rows.

- `id uuid primary key`
- `city_id uuid references cities(id) on delete set null`
- `name text`
- `category text`
- `description text`
- `duration_minutes integer`
- `estimated_cost numeric`
- `currency text`
- `rating numeric`
- `location jsonb`
- `tags text[]`
- `source text`
- `created_by uuid references auth.users(id) on delete set null`
- `is_seed boolean`
- `search_text text`
- `metadata jsonb`
- `lock_version integer`
- timestamps

Seed activities are visible to everyone. User-created activities are visible only to their creator unless exposed through a public itinerary RPC payload.

### itinerary_days

Trip-owned day records.

- `id uuid primary key`
- `trip_id uuid references trips(id) on delete cascade`
- `day_number integer`
- `date date`
- `city_id uuid references cities(id) on delete set null`
- `title text`
- `notes text`
- `sort_order integer`
- `metadata jsonb`
- `lock_version integer`
- timestamps

Unique: `(trip_id, day_number)`.

### itinerary_items

Trip-owned scheduled items.

- `id uuid primary key`
- `trip_id uuid references trips(id) on delete cascade`
- `day_id uuid references itinerary_days(id) scoped to the same trip`
- `activity_id uuid references activities(id) on delete set null`
- `city_id uuid references cities(id) on delete set null`
- `title text`
- `description text`
- `start_time time`
- `end_time time`
- `location jsonb`
- `estimated_cost numeric`
- `currency text`
- `booking_status text`: `idea`, `planned`, `booked`, `cancelled`, `completed`
- `notes text`
- `sort_order integer`
- `metadata jsonb`
- `lock_version integer`
- timestamps

### expenses

Trip-owned expenses remain compatible and now may link to itinerary items.

- Existing columns remain unchanged.
- New optional link: `itinerary_item_id uuid references itinerary_items(id) on delete set null`
- Production columns: `metadata jsonb`, `lock_version integer`

The database derives `expenses.user_id` from the parent trip to avoid cross-owner writes.

### packing_items

Trip-owned checklist.

- `id uuid primary key`
- `trip_id uuid references trips(id) on delete cascade`
- `name text`
- `category text`
- `quantity integer`
- `is_packed boolean`
- `notes text`
- `sort_order integer`
- `metadata jsonb`
- `lock_version integer`
- timestamps

### journal_entries

Trip-owned journal records.

- `id uuid primary key`
- `trip_id uuid references trips(id) on delete cascade`
- `day_id uuid references itinerary_days(id) on delete set null`
- `itinerary_item_id uuid references itinerary_items(id) on delete set null`
- `title text`
- `body text`
- `entry_date date`
- `mood text`
- `is_public boolean`
- `metadata jsonb`
- `lock_version integer`
- timestamps

`day_id` and `itinerary_item_id` must belong to the same trip.

## RLS Rules

- `profiles`: authenticated users can read/write only their own profile.
- `trips`: authenticated users can read/write only their own trips.
- `expenses`: authenticated users can read/write only expenses owned through their trips.
- `itinerary_days`, `itinerary_items`, `packing_items`, `journal_entries`: authenticated users can read/write only child records for their own trips.
- `cities`: readable by anonymous and authenticated users; writes require admin.
- `activities`: seed rows are public readable, own rows are creator readable/writeable, admin can manage all.
- `trip_activity_events`: trip owners and admins can read; clients write through `record_trip_activity_event`.
- `public_share_access_events`: admin-readable operational analytics only.
- `seed_runs`: admin-readable seed history only.
- Public sharing does not rely on direct table reads. `/share/:shareId` must use `load_public_itinerary`.
- Admin analytics must use `get_admin_analytics`; direct profile or private expense access is not exposed to frontend clients.

## RPC Contract

### generate_trip_number

Name: `generate_trip_number(user_uuid uuid)`  
Returns: `text`

Compatible with the existing Safarnama service call. Returns values like `TR001`.

### search_cities

Name: `search_cities(p_query text, p_limit integer default 10)`  
Returns rows:

- `id`
- `name`
- `region`
- `country`
- `country_code`
- `lat`
- `lng`
- `timezone`
- `image_url`

Use for City Search inputs.

### search_activities

Name: `search_activities(p_city_id uuid default null, p_query text default null, p_category text default null, p_limit integer default 20)`  
Returns rows:

- `id`
- `city_id`
- `city_name`
- `name`
- `category`
- `description`
- `duration_minutes`
- `estimated_cost`
- `currency`
- `rating`
- `location`
- `tags`
- `source`
- `is_seed`

Use for Activity Search and itinerary item suggestions.

### load_public_itinerary

Name: `load_public_itinerary(p_share_id text)`  
Returns: `jsonb | null`

Payload shape:

- `trip`: public trip summary, no `user_id`
- `primary_city`: city summary or `null`
- `itinerary_days`: day-wise itinerary with nested items when `public_show_itinerary = true`
- `packing_items`: visible only when `public_show_packing = true`
- `journal_entries`: only entries where `is_public = true`, visible only when `public_show_journal = true`
- `expenses`: visible only when `public_show_expenses = true`
- `visibility`: public visibility flags

Private profile fields are never included.

### get_admin_analytics

Name: `get_admin_analytics(p_from_date date default null, p_to_date date default null)`  
Returns: `jsonb`

Requires `profiles.role = 'admin'` for the authenticated user. Payload includes aggregate-only metrics:

- totals for users, trips, public shares, expenses amount, cities, activities, itinerary items, packing items, journal entries
- operational totals for public share views and trip activity events
- trips by status
- expenses by category
- top cities
- daily trip creations
- daily public share views

### record_trip_activity_event

Name: `record_trip_activity_event(p_trip_id uuid, p_event_type text, p_entity_table text default null, p_entity_id uuid default null, p_metadata jsonb default '{}'::jsonb)`
Returns: `uuid`

Records owner/admin-authorized operational events for future audit, import/export, collaboration, and support workflows.

## Seed Data Contract

Seed files should target only `cities` and seed `activities`. The current seed entrypoint is `supabase/seed.sql`.

- Cities require: `name`, `country`; recommended: `region`, `country_code`, `lat`, `lng`, `timezone`, `image_url`.
- Seed activities require: `name`, `category`, `source`, `is_seed = true`; recommended: `city_id`, `description`, `duration_minutes`, `estimated_cost`, `currency`, `rating`, `location`, `tags`.
- Seed imports should run with service role or admin privileges.

## Frontend Notes

- Main routes remain exactly: `/`, `/dashboard`, `/add-trip`, `/edit-trip/:id`, `/trip/:id`, `/trip/:id/itinerary`, `/trip/:id/checklist`, `/trip/:id/journal`, `/share/:shareId`, `/admin/analytics`, `/settings`, `/profile`, `*`.
- Trip detail tabs remain: Overview, Itinerary, Expenses, Packing, Journal, Share.
- Public pages should call only `load_public_itinerary`.
- Admin analytics pages should call only `get_admin_analytics`.
- Avoid selecting `profiles` for public or admin dashboards unless a later phase explicitly adds a safe profile summary view.

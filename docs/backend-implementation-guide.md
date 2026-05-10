# Backend Implementation Guide

Developer 3 owns Supabase schema, migrations, RLS, RPCs, seed data, security, and performance. This guide explains the current backend contract after the Phase 1-6 hardening work.

## Migration Order

1. `supabase/migrations/20260510000000_phase0_backend_contract.sql`
   - Creates the initial Safarnama-compatible schema.
   - Preserves legacy `profiles`, `trips`, and `expenses`.
   - Adds `cities`, `activities`, `itinerary_days`, `itinerary_items`, `packing_items`, and `journal_entries`.
   - Adds core triggers, indexes, RLS policies, public sharing RPCs, search RPCs, admin analytics RPC, and `generate_trip_number`.

2. `supabase/migrations/20260510010000_backend_hardening_seed_contract.sql`
   - Keeps both legacy and pulled-frontend trip status values valid.
   - Relaxes legacy `trips.date` and `trips.time` to support newer start/end date flows.
   - Adds public share token constraints, seed identity indexes, analytics/filtering indexes, and database comments.
   - Hardens share ID generation with collision-safe token creation.
   - Prevents users from attaching another user's private activity to itinerary items.
   - Revokes direct execution of internal trigger/helper functions.

Rollback companion:

- `supabase/rollbacks/20260510010000_backend_hardening_seed_contract_down.sql`

3. `supabase/migrations/20260510020000_production_readiness.sql`
   - Adds forward-compatible `metadata jsonb` and `lock_version` columns across core tables.
   - Adds optimistic concurrency triggers.
   - Tightens currency/date validation without removing legacy fields.
   - Adds operational tables for trip audit events, public share access events, and seed run tracking.
   - Refreshes admin analytics with aggregate operational metrics.

Rollback companion:

- `supabase/rollbacks/20260510020000_production_readiness_down.sql`

Rollback files remove only artifacts from their paired migration. They do not drop legacy Safarnama tables.

## RLS Policies

- `profiles`: authenticated users can select/insert/update/delete only their own profile. Role escalation is blocked by `enforce_profile_role_guard`.
- `trips`: authenticated users can select/insert/update/delete only trips where `trips.user_id = auth.uid()`.
- `expenses`: authenticated users can access only their own expenses. `set_expense_owner` derives `user_id` from the parent trip and validates itinerary item ownership by trip.
- `itinerary_days`: authenticated users can access only days whose parent trip belongs to them.
- `itinerary_items`: authenticated users can access only items whose parent trip belongs to them. `validate_itinerary_item_links` also blocks references to another user's private activity.
- `packing_items`: authenticated users can access only checklist rows whose parent trip belongs to them.
- `journal_entries`: authenticated users can access only journal rows whose parent trip belongs to them. Public sharing still requires `journal_entries.is_public = true`.
- `cities`: anonymous and authenticated clients can read cities. Only admins can write.
- `activities`: anonymous clients can read seed activities. Authenticated users can read seed activities and their own activities. Admins can manage all.
- `trip_activity_events`: trip owners and admins can read trip events. Inserts should go through `record_trip_activity_event`.
- `public_share_access_events`: admins can read aggregate/audit data. Direct client writes are not exposed.
- `seed_runs`: admins can read seed history. Seed scripts update this table through SQL execution.

Public sharing is intentionally handled through `load_public_itinerary`, not direct table policies.

## RPC Functions

- `generate_trip_number(user_uuid uuid) -> text`
  - Safarnama-compatible trip number generator.
  - Keeps names like `TR001`.
  - Authenticated users can generate only their own numbers unless admin.

- `search_cities(p_query text, p_limit integer default 10) -> table`
  - Searches city name, region, country, and country code.
  - Uses `cities.search_text` and trigram indexing.
  - Available to anonymous and authenticated clients.

- `search_activities(p_city_id uuid default null, p_query text default null, p_category text default null, p_limit integer default 20) -> table`
  - Searches seed activities and caller-owned activities.
  - Supports city and category filters.
  - Uses RLS plus search indexes.

- `load_public_itinerary(p_share_id text) -> jsonb`
  - Public route data loader for `/share/:shareId`.
  - Returns no `user_id` and no private profile fields.
  - Includes expenses, packing, and journal only when owner visibility flags allow it.
  - Journal rows additionally require `journal_entries.is_public = true`.

- `get_admin_analytics(p_from_date date default null, p_to_date date default null) -> jsonb`
  - Requires authenticated user's `profiles.role = 'admin'`.
  - Returns aggregate-only analytics: totals, trip statuses, expense categories, top cities, daily trip creations, public share views, and trip activity event counts.
  - Does not return private profiles or row-level expense details.

- `record_trip_activity_event(p_trip_id uuid, p_event_type text, p_entity_table text default null, p_entity_id uuid default null, p_metadata jsonb default '{}'::jsonb) -> uuid`
  - Records an owner/admin-authorized trip event.
  - Use for future import/export, sharing, collaboration, and support audit trails.
  - Returns the inserted event UUID.

## Production Readiness Notes

- `metadata jsonb` exists on core tables for future provider IDs and import/export annotations. Store only non-secret JSON objects.
- `lock_version` increments on updates and can be used by frontend services for optimistic concurrency.
- `trip_activity_events` is append-only from application code via RPC, giving future auditability without exposing private data publicly.
- `public_share_access_events` gives the admin analytics backend a place to aggregate public share activity without exposing visitor-level data to normal users.
- `seed_runs` records seed batches so environments can verify which catalog seed set has been applied.
- Currency fields on `activities` and `itinerary_items` are normalized to uppercase ISO-style 3-letter codes.
- Itinerary day dates are validated against the trip date window when trip dates are present.

## Seed Data

Run after both migrations:

```sql
-- Supabase SQL Editor or Supabase CLI seed command
-- File: supabase/seed.sql
```

The seed script is idempotent. It inserts public catalog rows for:

- `cities`
- seed `activities` with `is_seed = true`
- `seed_runs` entry for seed observability

Seed scripts never create user-owned trips, expenses, packing items, or journals.

## Required Environment Variables

Frontend runtime:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Optional for Supabase CLI/deploy workflows:

```env
SUPABASE_PROJECT_ID=
SUPABASE_ACCESS_TOKEN=
SUPABASE_DB_PASSWORD=
```

Never expose the Supabase service role key in frontend code.

## Frontend Integration Notes

- Continue using existing route names exactly as agreed.
- The public page `/share/:shareId` should call only `load_public_itinerary`.
- Admin analytics should call only `get_admin_analytics`.
- City search should call `search_cities`.
- Activity search should call `search_activities`.
- Trip event/audit writes should call `record_trip_activity_event` instead of inserting directly into operational tables.
- Trip status values accepted by the backend now include legacy values `planning`, `in_progress`, `completed` and app-shell values `draft`, `planned`, `active`, `archived`.
- Existing legacy trip fields remain available: `trip_number`, `origin`, `destination`, `travel_mode`, `date`, `time`, `notes`, `travelers`, `total_expenses`, and `status`.

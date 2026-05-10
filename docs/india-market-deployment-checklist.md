# Traveloop India Market Deployment Checklist

Traveloop is now configured as an India-first travel planner. The production app should use Supabase Auth, India-only city/activity catalog search, INR costs, and Vercel deployment from the `main` branch.

## Current Production Readiness

- Real Supabase signup, login, logout, session restore, and protected routes are wired.
- Profile rows are created/updated against `profiles.user_id = auth.uid()`.
- Trip create/edit/delete persists to Supabase and creates itinerary day rows from trip dates.
- City listing is filtered to `country_code = 'IN'`.
- India catalog migration adds more Indian cities and seed activities.
- Vercel build uses `npm ci`, `npm run build`, `dist`, and SPA rewrites.

## Required Environment Variables

Set these in Vercel Project Settings -> Environment Variables for Production, Preview, and Development:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Keep these only for local admin/CLI workflows, not browser code:

- `SUPABASE_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`

## Supabase Manual Steps

1. Open Supabase SQL Editor.
2. Run all migrations in order from `supabase/migrations`.
3. Make sure the latest migration `20260510030000_india_market_readiness.sql` runs successfully.
4. Confirm Auth email provider is enabled under Authentication -> Providers -> Email.
5. For fast hackathon testing, disable email confirmation. For production launch, enable email confirmation and configure redirect URLs.
6. Add the deployed Vercel URL to Authentication -> URL Configuration -> Site URL.
7. Add local and deployed redirect URLs:
   - `http://localhost:5173`
   - your Vercel production domain
8. Keep RLS enabled on every public table.

## Vercel Manual Steps

1. Connect Vercel to `modak-tamajit/Traveloop`, branch `main`.
2. Confirm it is not connected to the old `PathPilot` project/repo.
3. Use these settings:
   - Framework Preset: Vite
   - Install Command: `npm ci`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add the Supabase env vars.
5. Redeploy from the latest `main` commit.

## India Market Notes

- Search catalog should stay India-only unless the product scope changes.
- Costs are displayed in INR and seed activities use `currency = 'INR'`.
- The seed catalog is a starter set, not a complete national inventory.
- For real scale, import a vetted city/place dataset into `cities` and `activities` using the same columns and keep `country_code = 'IN'`.
- Avoid scraping random place data into production. Use licensed APIs or manually curated data.

## Still Not Complete

- Expense CRUD needs write forms.
- Itinerary item add/edit/delete/reorder needs persistence.
- Packing checklist CRUD/templates need persistence.
- Journal CRUD and public/private flags need persistence.
- Public sharing controls need real enable/disable/regenerate/expiry writes.
- Admin analytics needs role-based live user testing.
- Capacitor Android/iOS setup and mobile device QA are still pending.

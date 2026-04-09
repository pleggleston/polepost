# PolePost (Phase 1 Foundation)

PolePost is a mobile-first, flyer-first local event discovery app. This repo currently implements **Phase 1** foundation:

- Next.js App Router + TypeScript + Tailwind
- Route groups for public/auth/organizer/admin
- Supabase server/client helpers
- Environment validation
- Shared role/visibility/status enums
- Auth/role guard utilities
- Initial Postgres schema + RLS migrations
- Seeded event categories

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env vars:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in values from your Supabase project settings.
4. Run dev server:
   ```bash
   npm run dev
   ```

## Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (canonical app origin for auth redirects; e.g. `https://polepost.app`)
- `NEXT_PUBLIC_VERCEL_URL` (optional fallback when `NEXT_PUBLIC_SITE_URL` is unset)
- `NEXT_PUBLIC_SUPABASE_PROJECT_REF` (optional but recommended safety check)
- `SUPABASE_SERVICE_ROLE_KEY`

Validation is centralized in `src/lib/validation/env.ts`.

For signup confirmation emails, PolePost sends `emailRedirectTo` to `/auth/confirm`. Keep Supabase email templates compatible with `{{ .RedirectTo }}` so confirmations return to the app URL instead of localhost.

## Database setup

Apply SQL migrations in order:

1. `supabase/migrations/202604070001_init_schema.sql`
2. `supabase/migrations/202604070002_rls_policies.sql`
3. `supabase/migrations/202604070003_seed_categories.sql`
4. `supabase/migrations/202604070004_storage_event_flyers.sql`

These create:
- `profiles`
- `organizers`
- `event_categories`
- `events`
- `saved_events`
- `event_swipes`
- `moderation_reviews`

See `docs/backend-foundation.md` for the backend schema/RLS/storage foundation audit and operational checklist.

## What remains before Phase 2

- Wire actual auth pages (sign in/up and callback).
- Add typed database client generation from Supabase.
- Add integration tests for RLS role matrix.
- Add CI checks (`lint`, `typecheck`, migration validation).
- Implement real browse query + event detail data fetching.

# PolePost Backend Foundation (MVP)

This document is the source of truth for the backend foundation that current app routes depend on.

## Migration order

Apply migrations in this exact order:

1. `supabase/migrations/202604070001_init_schema.sql`
2. `supabase/migrations/202604070002_rls_policies.sql`
3. `supabase/migrations/202604070003_seed_categories.sql`
4. `supabase/migrations/202604070004_storage_event_flyers.sql`

## Core tables used by the current app

- `profiles`
  - Used for role checks and access gating in auth, organizer, and admin flows.
  - Key columns used in app: `id`, `role`, `is_organizer_enabled`, `is_21_verified`, `home_city`, `home_state`.
- `organizers`
  - Used to resolve organizer ownership context and event ownership.
  - Key columns used in app: `id`, `owner_profile_id`, `name`, `is_active`.
- `event_categories`
  - Used for browse filters and organizer event form category picker.
  - Key columns used in app: `id`, `slug`, `label`, `is_active`, `sort_order`.
- `events`
  - Canonical event data for public feed/detail, organizer CRUD, and moderation.
  - Key columns used in app: `id`, `organizer_id`, `created_by_profile_id`, `title`, `slug`, `description`, `flyer_path`, `flyer_url`, `venue_name`, `address_line1`, `city`, `state`, `postal_code`, `starts_at`, `ends_at`, `timezone`, `category_id`, `visibility`, `age_requirement`, `external_url`, `lifecycle_status`, `moderation_status`, `moderation_reason`, `approved_at`, `approved_by_profile_id`, `rejected_at`, `created_at`, `updated_at`, `expires_at`.
- `saved_events`
  - Used for save/unsave and saved-events page.
  - Key columns used in app: `profile_id`, `event_id`, `created_at`.
- `event_swipes`
  - Used by Pole swipe feed persistence.
  - Key columns used in app: `profile_id`, `event_id`, `action`, `session_id`, `created_at`.
- `moderation_reviews`
  - Used to log moderation actions from admin moderation flow.
  - Key columns used in app: `event_id`, `reviewer_profile_id`, `decision`, `notes`, `reason_for_organizer`, `created_at`.

## Enums and exact values

- `app_role`: `user`, `organizer`, `moderator`, `admin`
- `event_visibility`: `public`, `registered`, `verified_21_plus`, `admin_only`
- `age_requirement`: `all_ages`, `age_18_plus`, `age_21_plus`
- `moderation_status`: `pending_review`, `approved`, `rejected`, `flagged`
- `event_lifecycle_status`: `draft`, `pending`, `approved`, `rejected`, `flagged`, `expired`
- `moderation_decision`: `approve`, `reject`, `flag`
- `swipe_action`: `dismiss`, `save`, `open`

App enum literals in `src/lib/db/enums.ts` are intentionally matched 1:1 with SQL enum values.

## RLS expectations (current)

- `profiles`
  - SELECT: self or moderator/admin.
  - UPDATE: self only.
- `organizers`
  - SELECT: public.
  - INSERT/UPDATE: organizer owner with `is_organizer_enabled=true` or admin.
- `event_categories`
  - SELECT: public.
  - mutations: moderator/admin only.
- `events`
  - SELECT: public view for approved+active events by visibility; organizer can read owned events; moderator/admin can read all.
  - INSERT: organizer owner or admin.
  - UPDATE: organizer owner (limited lifecycle/moderation states) or moderator/admin.
- `saved_events`
  - all actions: own rows only (`profile_id = auth.uid()`).
- `event_swipes`
  - all actions: own rows only (`profile_id = auth.uid()`).
- `moderation_reviews`
  - SELECT: moderator/admin, plus organizer owners for their own events.
  - INSERT: moderator/admin only.

## Seeded categories (current MVP)

Seeded by `202604070003_seed_categories.sql`:

- `music`
- `nightlife`
- `arts`
- `community`
- `food`
- `sports`
- `markets`

## Flyer storage bucket plan

- Bucket name: `event-flyers`.
- Bucket is public for read URLs.
- Max file size: 5 MB.
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
- Object path convention used by app: `<auth.uid()>/<timestamp>-<uuid>.<ext>`.
- Storage policies enforce:
  - public read of `event-flyers` objects,
  - authenticated upload/update/delete only in caller-owned top-level folder (`auth.uid()` prefix), unless admin.

## Manual Supabase setup still required

- Apply all migrations in order.
- Ensure auth users exist (profile rows are created by `handle_new_user()` trigger).
- For organizer flows, set `profiles.is_organizer_enabled = true` and set appropriate `profiles.role` where needed.
- For moderation flows, set `profiles.role` to `moderator` or `admin` for staff accounts.

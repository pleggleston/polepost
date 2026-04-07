# PolePost MVP Master Implementation Brief

## 1. Product Summary
PolePost is a **mobile-first, flyer-first local event discovery product** centered on a swipe experience called **The Pole**.

### MVP objective
Prove three core hypotheses:
1. Consumers will browse local events via a swipeable flyer feed.
2. Organizers will submit flyers through a lightweight upload flow.
3. Public and age-gated events can coexist with strict role-based access and moderation.

### Non-goals (strict)
- No comments, DMs, follows, reactions, social graph.
- No internal ticketing/payments.
- No chat.
- No native app in MVP.
- No heavyweight recommendation/ML stack.

---

## 2. Recommended Stack
Use exactly this stack for MVP:
- **Next.js (App Router) + TypeScript**
- **Tailwind CSS + shadcn/ui**
- **Framer Motion** (card swipe and feed transitions only)
- **Supabase Auth** (email/password + magic link optional)
- **Supabase Postgres** (core data + RLS)
- **Supabase Storage** (flyer uploads)
- **Vercel** deployment

Optional (only where justified):
- **Mapbox or map links only** (MVP can start with map deep links).
- **PostHog** for product analytics (swipes, save rate, detail CTR).
- **ICS export** utility for calendar.

Assumptions:
- Geography initially US city-based, not global geospatial ranking.
- Verification 21+ is admin-approved flag in MVP (not automated KYC).

---

## 3. User Roles and Permissions
### Roles
- `public` (unauthenticated visitor)
- `user` (registered)
- `organizer`
- `moderator`
- `admin`

### Capability matrix
- **Public visitor**
  - View approved `public` events not expired.
  - No save/swipe persistence.
  - No restricted events.
- **Registered user**
  - View approved `public` + `registered` events not expired.
  - Save/unsave events.
  - Swipe tracking.
- **Verified 21+ user**
  - Same as registered + approved `verified_21_plus` events.
- **Organizer**
  - Create/edit own events.
  - Upload flyer to storage.
  - Submit to moderation.
  - Cannot set moderation outcome.
- **Moderator/Admin**
  - Review queue and set moderation decisions.
  - Manage categories and visibility constraints.
  - View all event states.

### 21+ model
In `profiles`:
- `is_21_verified boolean default false`
- `verified_21_at timestamptz null`
- `verified_21_method text null` (manual_doc, in_person, trusted_partner)

---

## 4. Database Schema
Below is a concrete Supabase Postgres schema (MVP-grade).

### 4.1 `profiles`
Purpose: auth user metadata + role + verification state.
- `id uuid pk references auth.users(id) on delete cascade`
- `username text unique null`
- `display_name text null`
- `role app_role not null default 'user'`
- `is_organizer_enabled boolean not null default false`
- `is_21_verified boolean not null default false`
- `verified_21_at timestamptz null`
- `home_city text null`
- `home_state text null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes:
- `idx_profiles_role(role)`
- `idx_profiles_organizer_enabled(is_organizer_enabled)`

### 4.2 `organizers`
Purpose: organizer business/entity profile.
- `id uuid pk default gen_random_uuid()`
- `owner_profile_id uuid not null references profiles(id) on delete cascade`
- `name text not null`
- `slug text unique not null`
- `bio text null`
- `contact_email text null`
- `instagram_url text null`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraint:
- one owner can own one organizer in MVP: `unique(owner_profile_id)`

### 4.3 `event_categories`
Purpose: controlled categories for filtering.
- `id uuid pk default gen_random_uuid()`
- `slug text unique not null`
- `label text unique not null`
- `is_active boolean not null default true`
- `sort_order int not null default 100`
- `created_at timestamptz not null default now()`

Seed examples: music, nightlife, arts, community, food, sports, markets.

### 4.4 `events`
Purpose: canonical event records.
- `id uuid pk default gen_random_uuid()`
- `organizer_id uuid not null references organizers(id)`
- `created_by_profile_id uuid not null references profiles(id)`
- `title text not null`
- `slug text unique not null`
- `description text not null`
- `flyer_path text not null` (Supabase storage path)
- `flyer_url text null` (optional signed/public URL cache)
- `venue_name text not null`
- `address_line1 text null`
- `city text not null`
- `state text not null`
- `postal_code text null`
- `latitude numeric(9,6) null`
- `longitude numeric(9,6) null`
- `starts_at timestamptz not null`
- `ends_at timestamptz null`
- `timezone text not null default 'America/Los_Angeles'`
- `category_id uuid not null references event_categories(id)`
- `visibility event_visibility not null default 'public'`
- `age_requirement age_requirement not null default 'all_ages'`
- `external_url text null`
- `lifecycle_status event_lifecycle_status not null default 'draft'`
- `moderation_status moderation_status not null default 'pending_review'`
- `moderation_reason text null` (last rejection/flag summary shown to organizer)
- `approved_at timestamptz null`
- `approved_by_profile_id uuid null references profiles(id)`
- `rejected_at timestamptz null`
- `expired_at timestamptz null`
- `expires_at timestamptz generated always as (coalesce(ends_at, starts_at)) stored`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes:
- `idx_events_feed_window (starts_at, expires_at)`
- `idx_events_city_state (city, state)`
- `idx_events_visibility (visibility)`
- `idx_events_moderation (moderation_status)`
- `idx_events_lifecycle (lifecycle_status)`
- partial index for feed:
  - where `moderation_status='approved' and lifecycle_status='approved'`

### 4.5 `saved_events`
Purpose: user saved events.
- `id uuid pk default gen_random_uuid()`
- `profile_id uuid not null references profiles(id) on delete cascade`
- `event_id uuid not null references events(id) on delete cascade`
- `created_at timestamptz not null default now()`
- unique: `(profile_id, event_id)`

Index:
- `idx_saved_events_profile_created(profile_id, created_at desc)`

### 4.6 `event_swipes`
Purpose: analytics + feed exclusion state.
- `id uuid pk default gen_random_uuid()`
- `profile_id uuid not null references profiles(id) on delete cascade`
- `event_id uuid not null references events(id) on delete cascade`
- `action swipe_action not null` (`dismiss`, `save`, `open`)
- `session_id text null`
- `created_at timestamptz not null default now()`

Indexes:
- `idx_swipes_profile_event(profile_id, event_id)`
- `idx_swipes_profile_created(profile_id, created_at desc)`

### 4.7 `moderation_reviews`
Purpose: immutable moderation decision log.
- `id uuid pk default gen_random_uuid()`
- `event_id uuid not null references events(id) on delete cascade`
- `reviewer_profile_id uuid not null references profiles(id)`
- `decision moderation_decision not null` (`approve`, `reject`, `flag`)
- `notes text null` (internal)
- `reason_for_organizer text null` (external-facing)
- `created_at timestamptz not null default now()`

Indexes:
- `idx_reviews_event_created(event_id, created_at desc)`
- `idx_reviews_reviewer_created(reviewer_profile_id, created_at desc)`

### 4.8 `verification_requests` (recommended)
Purpose: track 21+ verification workflow.
- `id uuid pk default gen_random_uuid()`
- `profile_id uuid not null references profiles(id) on delete cascade`
- `status verification_status not null default 'pending'`
- `submitted_at timestamptz not null default now()`
- `reviewed_at timestamptz null`
- `reviewed_by_profile_id uuid null references profiles(id)`
- `notes text null`

Why include now: avoids hacking verification directly on profile without audit trail.

---

## 5. Enums and Status Models
Use explicit enums in Postgres.

```sql
create type app_role as enum ('user','organizer','moderator','admin');
create type event_visibility as enum ('public','registered','verified_21_plus','admin_only');
create type age_requirement as enum ('all_ages','age_18_plus','age_21_plus');
create type moderation_status as enum ('pending_review','approved','rejected','flagged');
create type event_lifecycle_status as enum ('draft','pending','approved','rejected','flagged','expired');
create type moderation_decision as enum ('approve','reject','flag');
create type swipe_action as enum ('dismiss','save','open');
create type verification_status as enum ('pending','approved','rejected');
```

### Why separate lifecycle and moderation
- `moderation_status` = trust/safety decision state.
- `lifecycle_status` = publication/time state.

This separation avoids overloading one field and makes auto-expiration deterministic:
- nightly job sets `lifecycle_status='expired'` where `expires_at < now()` and currently approved.

---

## 6. RLS Policy Plan
Enable RLS on all user data tables:
- `profiles`, `organizers`, `events`, `saved_events`, `event_swipes`, `moderation_reviews`, `verification_requests`, `event_categories`.

Also define helper SQL functions (security definer):
- `auth_profile_id()` => `auth.uid()`
- `is_admin()` / `is_moderator_or_admin()` from `profiles.role`
- `is_organizer_for_event(event_id)` via join events->organizers->profiles
- `can_view_event(event_row)` function for visibility rules

### 6.1 `profiles`
- SELECT:
  - user can read own profile.
  - moderator/admin can read all.
- UPDATE:
  - user can update own safe columns (display_name, city/state).
  - role and verification flags only moderator/admin.
- INSERT:
  - only via trigger on `auth.users` signup (service role).

### 6.2 `organizers`
- SELECT:
  - public can read active organizers referenced by approved events (or simpler: authenticated + public read allowed).
- INSERT/UPDATE:
  - only profile owner with `is_organizer_enabled=true` OR admin.
- DELETE:
  - admin only.

### 6.3 `event_categories`
- SELECT: public.
- INSERT/UPDATE/DELETE: moderator/admin only.

### 6.4 `events`
**SELECT**
- Public visitor:
  - approved + not expired + visibility=`public`.
- Authenticated user:
  - approved + not expired + visibility in (`public`,`registered`).
  - if `is_21_verified=true`, include `verified_21_plus`.
- Moderator/admin:
  - all events.
- Organizer:
  - all events they own (any status), plus normal public visibility for others.

**INSERT**
- Organizer/admin only.
- `created_by_profile_id = auth.uid()`.
- Must belong to organizer row owned by caller unless admin.
- Force defaults:
  - `moderation_status='pending_review'`
  - `lifecycle_status='pending'`

**UPDATE**
- Organizer can update own events only when moderation status in (`pending_review`,`rejected`,`flagged`) and not expired.
- Organizer cannot set moderation fields, approved_by, approved_at.
- Moderator/admin can update moderation + lifecycle fields.

**DELETE**
- Admin only (or soft delete preferred by setting rejected/expired).

### 6.5 `saved_events`
- SELECT/INSERT/DELETE only where `profile_id = auth.uid()`.
- No public access.
- INSERT requires event is currently viewable by user (`can_view_event`).

### 6.6 `event_swipes`
- SELECT/INSERT only own rows (`profile_id=auth.uid()`).
- Optional DELETE own rows for privacy reset.
- INSERT requires event is viewable by user at insertion time.

### 6.7 `moderation_reviews`
- SELECT:
  - moderator/admin all.
  - organizer can read reviews for own events (for rejection reason transparency; may hide internal notes).
- INSERT:
  - moderator/admin only.
- UPDATE/DELETE:
  - admin only, ideally immutable (no update/delete) in MVP.

### 6.8 `verification_requests`
- SELECT/INSERT:
  - own requests by user.
- UPDATE:
  - moderator/admin decision only.

### Critical implementation note
For public (unauthenticated) browsing with RLS, use anon key and policies referencing `auth.uid() is null` branch for public visibility. Do not bypass with service role in client paths.

---

## 7. Route Map
Use App Router with route groups:

### Public
- `/` → landing + CTA + top local flyers
- `/browse` → scroll/list discover view with filters
- `/events/[slug]` → event detail page (SSR)

### Authenticated user
- `/pole` → swipe feed
- `/saved` → saved events
- `/profile` → profile and verification status
- `/settings` → account settings

### Organizer
- `/organizer` → organizer home/status metrics
- `/organizer/events` → my events list + statuses
- `/organizer/events/new` → create/upload flow
- `/organizer/events/[id]/edit` → edit submission

### Admin/moderation
- `/admin` → moderation dashboard summary
- `/admin/moderation` → queue + decisions
- `/admin/events` → event management list
- `/admin/categories` → category CRUD
- `/admin/verification` → 21+ verification requests

### API / server actions
Prefer server actions for mutations, but keep API handlers where needed:
- `/api/events/[id]/ics`
- `/api/share/[slug]` (optional dynamic metadata)

---

## 8. Recommended Codebase Structure
```txt
/src
  /app
    /(public)
      page.tsx
      browse/page.tsx
      events/[slug]/page.tsx
    /(auth)
      pole/page.tsx
      saved/page.tsx
      profile/page.tsx
      settings/page.tsx
    /(organizer)
      organizer/page.tsx
      organizer/events/page.tsx
      organizer/events/new/page.tsx
      organizer/events/[id]/edit/page.tsx
    /(admin)
      admin/page.tsx
      admin/moderation/page.tsx
      admin/events/page.tsx
      admin/categories/page.tsx
      admin/verification/page.tsx
    /api
      events/[id]/ics/route.ts
  /components
    /pole
      swipe-card.tsx
      swipe-deck.tsx
      pole-filters.tsx
    /events
      event-card.tsx
      event-detail.tsx
      save-button.tsx
    /organizer
      event-form.tsx
      flyer-upload.tsx
    /admin
      moderation-table.tsx
      moderation-actions.tsx
    /ui
      ...shadcn components
  /lib
    /supabase
      client.ts
      server.ts
      middleware.ts
    /auth
      guards.ts
      role-checks.ts
    /db
      types.ts
      enums.ts
      queries/
        events.ts
        saved-events.ts
        moderation.ts
    /validation
      event.schema.ts
      organizer.schema.ts
      filters.schema.ts
    /feed
      rank-events.ts
      exclude-events.ts
    /calendar
      ics.ts
    /maps
      links.ts
  /styles
    globals.css
```

### Boundaries
- **Server components**: data fetch pages (browse, detail, saved, admin lists).
- **Client components**: swipe deck, save buttons, filter controls, uploader.
- **Supabase server client** in `lib/supabase/server.ts` for SSR/actions.
- **Browser client** in `lib/supabase/client.ts` for interactive auth state.
- **Route guards** in middleware + server utility (`requireRole`, `requireAuth`).

---

## 9. Core Workflows
### 9.1 Organizer upload flow (MVP)
1. Organizer signs in.
2. Visits `/organizer/events/new`.
3. Uploads flyer to Supabase Storage bucket `event-flyers`.
4. Completes metadata form (title, desc, date/time, location, category, visibility, external URL).
5. Submits event.
6. System writes event with:
   - `lifecycle_status='pending'`
   - `moderation_status='pending_review'`
7. Organizer sees event in `/organizer/events` with status badge.
8. Organizer can edit while pending/rejected/flagged.
9. Moderator decision updates status and optional reason.

### 9.2 Admin moderation flow (MVP)
1. Moderator opens `/admin/moderation` queue filtered by `pending_review`.
2. Opens event preview with flyer and metadata.
3. Decision:
   - Approve → `moderation_status='approved'`, `lifecycle_status='approved'`, `approved_at=now()`.
   - Reject → `moderation_status='rejected'`, `lifecycle_status='rejected'`, save organizer-facing reason.
   - Flag → `moderation_status='flagged'`, `lifecycle_status='flagged'`, notes for follow-up.
4. Insert immutable `moderation_reviews` row.
5. Approved events become publicly visible per visibility rules.
6. Rejected/flagged remain hidden from consumer feed.

### 9.3 Saved events flow
1. Authenticated user taps save on card/detail.
2. Insert into `saved_events` (idempotent unique pair).
3. `/saved` lists upcoming saved events sorted by `starts_at`.
4. User can remove save.
5. “Add to calendar” from detail or saved list.

### 9.4 Auto-expiration flow
- Scheduled job (Supabase cron/pg_cron or Vercel cron hitting secure endpoint) every hour:
  - set events to `lifecycle_status='expired', expired_at=now()` where `expires_at < now()` and status currently approved.
- Feed query always excludes `expired` and `expires_at < now()`.

---

## 10. Feed Logic for The Pole
Deterministic MVP ranking (no ML).

### Candidate selection
Query approved, non-expired, visibility-allowed events for user context.

### Exclusions
Exclude events user already:
- dismissed recently (from `event_swipes` action=`dismiss`, configurable lookback e.g., 30 days)
- saved (show in saved, not main pole by default)
- expired or ended

### Scoring formula (simple weighted)
`score = freshness + date_proximity + location_match + category_preference - stale_penalty`

Suggested components:
- `freshness`: newer approved_at gets boost.
- `date_proximity`: starts soon (today/this weekend) gets boost.
- `location_match`: same city as selected city/home city gets boost.
- `category_preference`: implicit from prior saves by category (tiny boost only).
- `stale_penalty`: older event age penalty.

### Tie-breaker
- Higher score, then earlier starts_at, then newest created_at.

### Pagination
- Cursor-based batches of 20 cards.
- Prefetch next batch when remaining cards < 5.

### Swipe behavior
- Left swipe: create `event_swipes(dismiss)` and animate to next.
- Right swipe: create `saved_events` + `event_swipes(save)` and animate success state.
- Tap card: open detail and optionally `event_swipes(open)`.

### Filters in Pole
- city / near me
- timeframe (`today`, `this_week`, `this_weekend`)
- category
- visibility automatically constrained by role/verification

---

## 11. Calendar and Map Approach
### Calendar (MVP-safe)
- Use ICS generation endpoint `/api/events/[id]/ics`.
- Event detail button: “Add to Calendar”.
- Support:
  - Apple Calendar (downloads `.ics`)
  - Google Calendar (either import ICS or prefilled Google Calendar URL)
- Store all times in UTC + timezone field, render localized on client.

### Map/location (simple)
- Store `venue_name`, `address`, `city/state`, optional `lat/lng`.
- Event detail shows compact location block.
- Primary action: deep link button:
  - Apple Maps: `http://maps.apple.com/?q=...`
  - Google Maps: `https://www.google.com/maps/search/?api=1&query=...`
- Do not build embedded interactive map in phase 1–3.

---

## 12. Phased Build Plan
## Phase 1: Setup + Auth + Schema
**Objective:** foundation and access control.
- Deliverables:
  - Next.js app scaffold, Tailwind, shadcn/ui, Supabase wiring.
  - SQL migrations for enums/tables/indexes.
  - RLS policies and helper SQL functions.
  - auth flows + middleware guards.
- Dependencies: Supabase project, env vars, storage bucket.
- Exit tests:
  - role-based route access.
  - RLS smoke tests for each role.
  - profile auto-create trigger test.

## Phase 2: Public Browse + Event Detail
**Objective:** public value without auth.
- Deliverables:
  - `/browse` list/cards.
  - `/events/[slug]` detail page.
  - share metadata/open graph basics.
- Dependencies: approved event seed data.
- Exit tests:
  - anon can only view approved public non-expired.
  - detail page 404 for unauthorized visibility.

## Phase 3: The Pole Swipe Feed
**Objective:** core hypothesis: swipe browsing.
- Deliverables:
  - `/pole` swipe deck with Framer Motion.
  - swipe left/right interactions.
  - save + dismiss persistence.
  - feed query with deterministic ranking and filters.
- Dependencies: auth session + `saved_events` + `event_swipes`.
- Exit tests:
  - swipe writes correct records.
  - dismissed cards do not reappear immediately.
  - smooth mobile interaction baseline.

## Phase 4: Organizer Upload Flow
**Objective:** supply-side content intake.
- Deliverables:
  - organizer dashboard routes.
  - flyer upload component + storage integration.
  - event create/edit forms + validation.
  - pending moderation state pipeline.
- Dependencies: organizer role enablement.
- Exit tests:
  - organizer can CRUD own events within allowed states.
  - non-organizers blocked by guard + RLS.

## Phase 5: Admin Moderation
**Objective:** trust/safety and publication control.
- Deliverables:
  - moderation queue UI.
  - approve/reject/flag actions.
  - moderation notes + organizer-visible reason.
  - category management page.
- Dependencies: moderator/admin roles.
- Exit tests:
  - only moderator/admin can moderate.
  - decisions correctly change feed visibility.
  - moderation review log integrity.

## Phase 6: Saved Events + Calendar
**Objective:** retention loop.
- Deliverables:
  - `/saved` page.
  - unsave action.
  - ICS export endpoint and calendar actions.
- Dependencies: authenticated saves.
- Exit tests:
  - saved list contains only user’s own records.
  - ICS downloads with correct start/end/timezone.

## Phase 7: Filters, Expiration, Polish
**Objective:** improve quality and reduce stale content.
- Deliverables:
  - city/time/category filters on browse + pole.
  - scheduled expiration job.
  - basic analytics events (view/open/swipe/save).
  - performance and UX polish.
- Dependencies: stable core flows.
- Exit tests:
  - expired events removed automatically.
  - filters produce expected subsets.
  - mobile Lighthouse/perf sanity checks.

---

## 13. Technical Risks and Design Warnings
1. **Cold-start marketplace risk (highest):** no events => no user retention. Must seed launch city manually.
2. **Moderation bottleneck:** if submissions rise, manual queue becomes operational burden quickly.
3. **Age-gated legal/compliance risk:** “21+ verified” claim must match your jurisdiction and process; avoid overstating verification quality.
4. **Organizer friction risk:** long forms and strict required fields reduce submissions. Keep form minimal.
5. **Feed quality risk:** naive ranking can feel repetitive. Track dismiss/save ratios early.
6. **RLS complexity risk:** policy bugs can leak restricted content. Test policies with role-specific integration tests.
7. **Overbuilding risk:** avoid maps, analytics, and advanced personalization until swipe/save retention is proven.
8. **Image moderation gap:** flyer uploads can include prohibited content; include basic report/escalation plan even in MVP.

---

## Suggested Initial Build Tickets

### Phase 1 Tickets (Setup + Auth + Schema)
- [P1-01] Initialize Next.js App Router + TypeScript + Tailwind + shadcn/ui baseline.
- [P1-02] Add Supabase clients (server/browser) and env configuration.
- [P1-03] Create SQL migration: enums + core tables + indexes.
- [P1-04] Implement profile auto-create trigger on new auth user.
- [P1-05] Implement helper SQL functions (`is_admin`, `is_moderator_or_admin`, etc.).
- [P1-06] Implement RLS policies per table.
- [P1-07] Add middleware + server guard utilities for roles.
- [P1-08] Seed event categories.
- [P1-09] Add RLS integration tests (anon/user/verified/organizer/mod/admin matrix).

### Phase 2 Tickets (Public Browse + Detail)
- [P2-01] Build `/browse` mobile-first flyer card list.
- [P2-02] Build `/events/[slug]` SSR detail page.
- [P2-03] Add public filter controls (city, timeframe, category).
- [P2-04] Add social share metadata tags.
- [P2-05] Add empty-state and no-events UX.

### Phase 3 Tickets (The Pole)
- [P3-01] Build swipe deck component with Framer Motion.
- [P3-02] Implement feed query service (visibility + exclusions + ranking).
- [P3-03] Implement swipe actions (`dismiss`, `save`, `open`) persistence.
- [P3-04] Add save CTA + auth gate for unauthenticated users.
- [P3-05] Add pagination/prefetch for feed batches.
- [P3-06] Add lightweight event tracking hooks (swipe/save/open).

### Phase 4 Tickets (Organizer)
- [P4-01] Build organizer route group and guard.
- [P4-02] Build flyer uploader (Supabase Storage bucket + path strategy).
- [P4-03] Build event create form with zod validation.
- [P4-04] Build organizer events list with moderation/lifecycle badges.
- [P4-05] Build event edit form with field-level permission constraints.
- [P4-06] Add organizer rejection reason display.

### Phase 5 Tickets (Admin/Moderation)
- [P5-01] Build moderation queue table/cards.
- [P5-02] Build moderation decision panel (approve/reject/flag + notes).
- [P5-03] Implement moderation transaction (event status update + review log insert).
- [P5-04] Build admin events management list.
- [P5-05] Build category management CRUD page.
- [P5-06] Build verification request review page.

### Phase 6 Tickets (Saved + Calendar)
- [P6-01] Build `/saved` upcoming events list.
- [P6-02] Add unsave action + optimistic UI.
- [P6-03] Implement ICS generation endpoint.
- [P6-04] Add “Add to Calendar” buttons (ICS + Google link).
- [P6-05] Add saved-events sorting and filter by timeframe.

### Phase 7 Tickets (Polish + Expiration)
- [P7-01] Implement scheduled expiration job.
- [P7-02] Add final feed tuning constants and config.
- [P7-03] Improve loading skeletons, motion polish, and touch feedback.
- [P7-04] Add abuse/report scaffolding (optional MVP+).
- [P7-05] Add production observability (error logging + PostHog key funnels).

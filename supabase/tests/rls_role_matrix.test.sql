-- RLS role-matrix integration tests using pgTAP.
-- Run with: supabase test db  (requires: supabase start)
--
-- Coverage:
--   profiles         — SELECT gating, UPDATE self / admin / others
--   event_categories — public SELECT, staff-only mutation
--   organizers       — public SELECT, insert rules (pending vs. active)
--   events           — visibility gating (public, 21+, approved-only)
--   saved_events     — own-row enforcement
--   moderation_reviews — staff INSERT, non-staff blocked

begin;

select plan(26);

-- ─────────────────────────────────────────────────────────
-- Helper: create a test user + profile
-- ─────────────────────────────────────────────────────────
create or replace function tests.make_user(
  p_email              text,
  p_role               public.app_role default 'user',
  p_organizer_enabled  boolean default false,
  p_21_verified        boolean default false
) returns uuid
language plpgsql security definer as $$
declare v_uid uuid := gen_random_uuid();
begin
  insert into auth.users (
    id, email, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, aud, "role"
  ) values (
    v_uid, p_email, now(), '{}', '{}',
    now(), now(), 'authenticated', 'authenticated'
  );
  update public.profiles
  set "role"               = p_role,
      is_organizer_enabled = p_organizer_enabled,
      is_21_verified       = p_21_verified
  where id = v_uid;
  return v_uid;
end;
$$;

-- Helper: impersonate a user for the remainder of the transaction.
create or replace function tests.set_auth(p_uid uuid)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end;
$$;

-- Helper: drop to anonymous.
create or replace function tests.set_anon()
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '{}', true);
  perform set_config('role', 'anon', true);
end;
$$;

-- ─────────────────────────────────────────────────────────
-- Fixtures
-- ─────────────────────────────────────────────────────────
set session_replication_role = replica;  -- bypass handle_new_user trigger

do $$
declare
  v_regular_uid   uuid := tests.make_user('user@test.invalid',      'user');
  v_organizer_uid uuid := tests.make_user('org@test.invalid',       'organizer', true);
  v_mod_uid       uuid := tests.make_user('mod@test.invalid',       'moderator');
  v_admin_uid     uuid := tests.make_user('admin@test.invalid',     'admin');
  v_org_id        uuid;
  v_cat_id        uuid;
begin
  perform set_config('tests.regular_uid',   v_regular_uid::text,   false);
  perform set_config('tests.organizer_uid', v_organizer_uid::text, false);
  perform set_config('tests.mod_uid',       v_mod_uid::text,       false);
  perform set_config('tests.admin_uid',     v_admin_uid::text,     false);

  insert into public.organizers (id, owner_profile_id, name, slug, is_active)
  values (gen_random_uuid(), v_organizer_uid, 'Test Org', 'test-org', true)
  returning id into v_org_id;

  insert into public.event_categories (id, slug, label, is_active, sort_order)
  values (gen_random_uuid(), 'test-cat', 'Test Category', true, 10)
  returning id into v_cat_id;

  perform set_config('tests.org_id',  v_org_id::text,  false);
  perform set_config('tests.cat_id',  v_cat_id::text,  false);
end;
$$;

set session_replication_role = default;

-- ─────────────────────────────────────────────────────────
-- 1. profiles — SELECT
-- ─────────────────────────────────────────────────────────

select tests.set_anon();
select is((select count(*)::int from public.profiles), 0,
  'anon: cannot select any profiles');                                            -- 1

select tests.set_auth(current_setting('tests.regular_uid')::uuid);
select is(
  (select count(*)::int from public.profiles
   where id = current_setting('tests.regular_uid')::uuid), 1,
  'user: can select own profile');                                                -- 2

select is(
  (select count(*)::int from public.profiles
   where id != current_setting('tests.regular_uid')::uuid), 0,
  'user: cannot select other profiles');                                          -- 3

select tests.set_auth(current_setting('tests.mod_uid')::uuid);
select ok((select count(*)::int from public.profiles) >= 4,
  'moderator: can select all profiles');                                          -- 4

select tests.set_auth(current_setting('tests.admin_uid')::uuid);
select ok((select count(*)::int from public.profiles) >= 4,
  'admin: can select all profiles');                                              -- 5

-- ─────────────────────────────────────────────────────────
-- 2. profiles — UPDATE
-- ─────────────────────────────────────────────────────────

-- User can update own profile
select tests.set_auth(current_setting('tests.regular_uid')::uuid);
select lives_ok(
  format($$update public.profiles set display_name = 'Me' where id = %L$$,
    current_setting('tests.regular_uid')),
  'user: can update own profile');                                                -- 6

-- User update to another profile — RLS silently prevents it (0 rows affected)
select is(
  (with upd as (
    update public.profiles set display_name = 'Hacked'
    where id = current_setting('tests.mod_uid')::uuid
    returning id
  ) select count(*)::int from upd),
  0,
  'user: update to another profile affects 0 rows');                             -- 7

-- Admin can update any profile (profiles_update_admin policy)
select tests.set_auth(current_setting('tests.admin_uid')::uuid);
select lives_ok(
  format($$update public.profiles set requested_21_at = now() where id = %L$$,
    current_setting('tests.regular_uid')),
  'admin: can update any profile');                                               -- 8

-- Moderator cannot update another profile (no cross-user policy for mods)
select tests.set_auth(current_setting('tests.mod_uid')::uuid);
select is(
  (with upd as (
    update public.profiles set display_name = 'Nope'
    where id = current_setting('tests.regular_uid')::uuid
    returning id
  ) select count(*)::int from upd),
  0,
  'moderator: cannot update other profiles (0 rows affected)');                  -- 9

-- ─────────────────────────────────────────────────────────
-- 3. event_categories
-- ─────────────────────────────────────────────────────────

select tests.set_anon();
select ok((select count(*)::int from public.event_categories) >= 1,
  'anon: can select event_categories');                                           -- 10

select tests.set_auth(current_setting('tests.regular_uid')::uuid);
select throws_ok(
  $$insert into public.event_categories (slug, label) values ('x-slug', 'X Label')$$,
  'user: cannot insert event_categories');                                        -- 11

select tests.set_auth(current_setting('tests.mod_uid')::uuid);
select lives_ok(
  $$insert into public.event_categories (slug, label, sort_order) values ('mod-cat', 'Mod Cat', 999)$$,
  'moderator: can insert event_categories');                                      -- 12

select tests.set_auth(current_setting('tests.admin_uid')::uuid);
select lives_ok(
  $$update public.event_categories set is_active = false where slug = 'mod-cat'$$,
  'admin: can update event_categories');                                          -- 13

-- ─────────────────────────────────────────────────────────
-- 4. organizers
-- ─────────────────────────────────────────────────────────

select tests.set_anon();
select ok((select count(*)::int from public.organizers) >= 1,
  'anon: can select organizers (public)');                                        -- 14

-- Regular user can apply (is_active must be false)
select tests.set_auth(current_setting('tests.regular_uid')::uuid);
select lives_ok(
  format($$insert into public.organizers (owner_profile_id, name, slug, is_active)
    values (%L, 'User Org', 'user-org', false)$$,
    current_setting('tests.regular_uid')),
  'user: can insert organizer with is_active=false');                             -- 15

-- Cannot self-approve (is_active=true bypasses pending flow)
select throws_ok(
  format($$insert into public.organizers (owner_profile_id, name, slug, is_active)
    values (%L, 'Bypass Org', 'bypass-org', true)$$,
    current_setting('tests.regular_uid')),
  'user: cannot insert organizer with is_active=true');                           -- 16

-- Admin can directly insert active organizer
select tests.set_auth(current_setting('tests.admin_uid')::uuid);
select lives_ok(
  format($$insert into public.organizers (owner_profile_id, name, slug, is_active)
    values (%L, 'Admin Org', 'admin-org', true)$$,
    current_setting('tests.admin_uid')),
  'admin: can insert active organizer directly');                                 -- 17

-- ─────────────────────────────────────────────────────────
-- 5. events — visibility
-- ─────────────────────────────────────────────────────────

do $$
declare v_future timestamptz := now() + interval '1 day';
begin
  insert into public.events (
    organizer_id, created_by_profile_id, title, slug, description,
    flyer_path, venue_name, city, state, starts_at, category_id,
    visibility, age_requirement, lifecycle_status, moderation_status
  ) values
  (
    current_setting('tests.org_id')::uuid,
    current_setting('tests.organizer_uid')::uuid,
    'Public Event', 'public-event', 'desc', 'f.jpg',
    'Venue', 'Portland', 'OR', v_future,
    current_setting('tests.cat_id')::uuid, 'public', 'all_ages',
    'approved', 'approved'
  ),
  (
    current_setting('tests.org_id')::uuid,
    current_setting('tests.organizer_uid')::uuid,
    '21+ Event', '21-plus-event', 'desc', 'f.jpg',
    'Venue', 'Portland', 'OR', v_future,
    current_setting('tests.cat_id')::uuid, 'verified_21_plus', 'age_21_plus',
    'approved', 'approved'
  );
end;
$$;

select tests.set_anon();
select ok(exists(select 1 from public.events where slug = 'public-event'),
  'anon: can see approved public event');                                         -- 18

select ok(not exists(select 1 from public.events where slug = '21-plus-event'),
  'anon: cannot see 21+ event');                                                  -- 19

select tests.set_auth(current_setting('tests.regular_uid')::uuid);
select ok(not exists(select 1 from public.events where slug = '21-plus-event'),
  'user (not 21+ verified): cannot see 21+ event');                              -- 20

-- Elevate user to 21+ using postgres superuser (bypasses RLS)
set local role postgres;
update public.profiles set is_21_verified = true
  where id = current_setting('tests.regular_uid')::uuid;

select tests.set_auth(current_setting('tests.regular_uid')::uuid);
select ok(exists(select 1 from public.events where slug = '21-plus-event'),
  'user (21+ verified): can see 21+ event');                                     -- 21

select tests.set_auth(current_setting('tests.mod_uid')::uuid);
select ok((select count(*)::int from public.events) >= 2,
  'moderator: can see all events regardless of visibility');                     -- 22

-- ─────────────────────────────────────────────────────────
-- 6. saved_events — own rows only
-- ─────────────────────────────────────────────────────────

select tests.set_auth(current_setting('tests.regular_uid')::uuid);
select lives_ok(
  format($$insert into public.saved_events (profile_id, event_id)
    select %L::uuid, id from public.events where slug = 'public-event'$$,
    current_setting('tests.regular_uid')),
  'user: can insert own saved_event');                                            -- 23

select throws_ok(
  format($$insert into public.saved_events (profile_id, event_id)
    select %L::uuid, id from public.events where slug = 'public-event'$$,
    current_setting('tests.organizer_uid')),
  'user: cannot insert saved_event for another profile');                        -- 24

-- ─────────────────────────────────────────────────────────
-- 7. moderation_reviews
-- ─────────────────────────────────────────────────────────

select tests.set_auth(current_setting('tests.regular_uid')::uuid);
select is((select count(*)::int from public.moderation_reviews), 0,
  'user: cannot see moderation_reviews');                                        -- 25

select throws_ok(
  format($$insert into public.moderation_reviews (event_id, reviewer_profile_id, decision)
    select id, %L::uuid, 'approve' from public.events where slug = 'public-event'$$,
    current_setting('tests.regular_uid')),
  'user: cannot insert moderation_review');                                      -- 26

-- (Moderator insert covered by moderation flow in integration; plan stops here)

select * from finish();
rollback;

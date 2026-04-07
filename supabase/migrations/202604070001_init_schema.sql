-- PolePost MVP Phase 1 schema
create extension if not exists pgcrypto;

create type app_role as enum ('user', 'organizer', 'moderator', 'admin');
create type event_visibility as enum ('public', 'registered', 'verified_21_plus', 'admin_only');
create type age_requirement as enum ('all_ages', 'age_18_plus', 'age_21_plus');
create type moderation_status as enum ('pending_review', 'approved', 'rejected', 'flagged');
create type event_lifecycle_status as enum ('draft', 'pending', 'approved', 'rejected', 'flagged', 'expired');
create type moderation_decision as enum ('approve', 'reject', 'flag');
create type swipe_action as enum ('dismiss', 'save', 'open');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text,
  role app_role not null default 'user',
  is_organizer_enabled boolean not null default false,
  is_21_verified boolean not null default false,
  verified_21_at timestamptz,
  home_city text,
  home_state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizers (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  slug text not null unique,
  bio text,
  contact_email text,
  instagram_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_profile_id)
);

create table public.event_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null unique,
  is_active boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.organizers (id),
  created_by_profile_id uuid not null references public.profiles (id),
  title text not null,
  slug text not null unique,
  description text not null,
  flyer_path text not null,
  flyer_url text,
  venue_name text not null,
  address_line1 text,
  city text not null,
  state text not null,
  postal_code text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'America/Los_Angeles',
  category_id uuid not null references public.event_categories (id),
  visibility event_visibility not null default 'public',
  age_requirement age_requirement not null default 'all_ages',
  external_url text,
  lifecycle_status event_lifecycle_status not null default 'draft',
  moderation_status moderation_status not null default 'pending_review',
  moderation_reason text,
  approved_at timestamptz,
  approved_by_profile_id uuid references public.profiles (id),
  rejected_at timestamptz,
  expired_at timestamptz,
  expires_at timestamptz generated always as (coalesce(ends_at, starts_at)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, event_id)
);

create table public.event_swipes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  action swipe_action not null,
  session_id text,
  created_at timestamptz not null default now()
);

create table public.moderation_reviews (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  reviewer_profile_id uuid not null references public.profiles (id),
  decision moderation_decision not null,
  notes text,
  reason_for_organizer text,
  created_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles (role);
create index idx_profiles_organizer_enabled on public.profiles (is_organizer_enabled);
create index idx_events_feed_window on public.events (starts_at, expires_at);
create index idx_events_city_state on public.events (city, state);
create index idx_events_visibility on public.events (visibility);
create index idx_events_moderation on public.events (moderation_status);
create index idx_events_lifecycle on public.events (lifecycle_status);
create index idx_saved_events_profile_created on public.saved_events (profile_id, created_at desc);
create index idx_swipes_profile_event on public.event_swipes (profile_id, event_id);
create index idx_swipes_profile_created on public.event_swipes (profile_id, created_at desc);
create index idx_reviews_event_created on public.moderation_reviews (event_id, created_at desc);
create index idx_reviews_reviewer_created on public.moderation_reviews (reviewer_profile_id, created_at desc);

create index idx_events_feed_active on public.events (starts_at, expires_at)
where moderation_status = 'approved' and lifecycle_status = 'approved';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_organizers_updated_at before update on public.organizers
for each row execute function public.set_updated_at();

create trigger set_events_updated_at before update on public.events
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

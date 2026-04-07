-- PolePost MVP Phase 1 RLS
alter table public.profiles enable row level security;
alter table public.organizers enable row level security;
alter table public.event_categories enable row level security;
alter table public.events enable row level security;
alter table public.saved_events enable row level security;
alter table public.event_swipes enable row level security;
alter table public.moderation_reviews enable row level security;

create or replace function public.current_role()
returns app_role
language sql
stable
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'user'::app_role);
$$;

create or replace function public.is_moderator_or_admin()
returns boolean
language sql
stable
as $$
  select public.current_role() in ('moderator', 'admin');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_role() = 'admin';
$$;

create or replace function public.is_event_owner(event_row public.events)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organizers o
    where o.id = event_row.organizer_id
      and o.owner_profile_id = auth.uid()
  );
$$;

create policy "profiles_select_self_or_staff"
on public.profiles
for select
using (id = auth.uid() or public.is_moderator_or_admin());

create policy "profiles_update_self"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "organizers_public_select"
on public.organizers
for select
using (true);

create policy "organizers_insert_owner_or_admin"
on public.organizers
for insert
with check ((owner_profile_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_organizer_enabled)) or public.is_admin());

create policy "organizers_update_owner_or_admin"
on public.organizers
for update
using (owner_profile_id = auth.uid() or public.is_admin())
with check (owner_profile_id = auth.uid() or public.is_admin());

create policy "event_categories_public_select"
on public.event_categories
for select
using (true);

create policy "event_categories_staff_mutation"
on public.event_categories
for all
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

create policy "events_select_visibility"
on public.events
for select
using (
  public.is_moderator_or_admin()
  or public.is_event_owner(events)
  or (
    moderation_status = 'approved'
    and lifecycle_status = 'approved'
    and expires_at >= now()
    and (
      visibility = 'public'
      or (auth.uid() is not null and visibility = 'registered')
      or (
        auth.uid() is not null
        and visibility = 'verified_21_plus'
        and exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.is_21_verified = true
        )
      )
    )
  )
);

create policy "events_insert_organizer_or_admin"
on public.events
for insert
with check (
  public.is_admin()
  or (
    created_by_profile_id = auth.uid()
    and exists (
      select 1
      from public.organizers o
      where o.id = organizer_id
        and o.owner_profile_id = auth.uid()
    )
  )
);

create policy "events_update_owner_or_staff"
on public.events
for update
using (public.is_moderator_or_admin() or public.is_event_owner(events))
with check (
  public.is_moderator_or_admin()
  or (
    public.is_event_owner(events)
    and moderation_status in ('pending_review', 'rejected', 'flagged')
    and lifecycle_status in ('draft', 'pending', 'rejected', 'flagged')
  )
);

create policy "saved_events_own_rows"
on public.saved_events
for all
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "event_swipes_own_rows"
on public.event_swipes
for all
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "moderation_reviews_select_staff_or_owner"
on public.moderation_reviews
for select
using (
  public.is_moderator_or_admin()
  or exists (
    select 1
    from public.events e
    join public.organizers o on o.id = e.organizer_id
    where e.id = moderation_reviews.event_id
      and o.owner_profile_id = auth.uid()
  )
);

create policy "moderation_reviews_insert_staff"
on public.moderation_reviews
for insert
with check (public.is_moderator_or_admin());

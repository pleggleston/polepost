-- Allow any authenticated user to submit an organizer application.
-- Applications are inserted with is_active = false (pending admin review).
-- Only admins can insert active organizer records directly.

drop policy "organizers_insert_owner_or_admin" on public.organizers;

create policy "organizers_insert_owner_or_admin"
on public.organizers
for insert
with check (
  public.is_admin()
  or (owner_profile_id = auth.uid() and is_active = false)
);

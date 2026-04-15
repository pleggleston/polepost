-- Add 21+ verification request field to profiles
-- Users set this when they want to request 21+ verification.
-- Admins approve/deny via the admin verification queue.
alter table public.profiles
  add column if not exists requested_21_at timestamptz;

-- Allow admins to update any profile row (needed for approving/denying verification).
-- The existing profiles_update_self policy covers self-updates.
create policy "profiles_update_admin"
on public.profiles
for update
using (public.is_admin())
with check (public.is_admin());

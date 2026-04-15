-- Function to mark events whose expires_at has passed as expired.
-- Called by the /api/cron/expire-events Next.js route on a schedule.
create or replace function public.expire_stale_events()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.events
  set
    lifecycle_status = 'expired',
    expired_at       = now()
  where expires_at < now()
    and lifecycle_status not in ('expired', 'rejected')
    and moderation_status = 'approved';

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

-- Only the service-role key (or a cron caller with SECURITY DEFINER) should invoke this.
revoke all on function public.expire_stale_events() from public, anon, authenticated;

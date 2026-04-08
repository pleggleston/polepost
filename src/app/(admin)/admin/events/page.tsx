import { AdminAccessBlocked } from '@/components/admin/admin-access-blocked';
import { AdminEventTable } from '@/components/admin/admin-event-table';
import { getAdminAccessContext, listAdminEvents } from '@/lib/admin/moderation';

export default async function AdminEventsPage() {
  let access: Awaited<ReturnType<typeof getAdminAccessContext>>;
  try {
    access = await getAdminAccessContext();
  } catch {
    return (
      <section className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Could not load admin access right now. Please refresh and try again.
      </section>
    );
  }

  if (!access.isAuthorized) {
    return <AdminAccessBlocked isAuthenticated={access.isAuthenticated} />;
  }

  let events: Awaited<ReturnType<typeof listAdminEvents>> = [];
  try {
    events = await listAdminEvents();
  } catch {
    return (
      <section className="space-y-4">
        <header className="rounded-xl border border-border bg-card p-4">
          <h1 className="text-lg font-semibold">Admin events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Full moderator/admin event listing with moderation and lifecycle state visibility.</p>
        </header>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Could not load admin event list right now.</div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold">Admin events</h1>
        <p className="mt-1 text-sm text-muted-foreground">Full moderator/admin event listing with moderation and lifecycle state visibility.</p>
      </header>

      <AdminEventTable events={events} />
    </section>
  );
}

import { AdminAccessBlocked } from '@/components/admin/admin-access-blocked';
import { AdminEventTable } from '@/components/admin/admin-event-table';
import { getAdminAccessContext, listAdminEvents } from '@/lib/admin/moderation';

export default async function AdminEventsPage() {
  const access = await getAdminAccessContext();

  if (!access.isAuthorized) {
    return <AdminAccessBlocked isAuthenticated={access.isAuthenticated} />;
  }

  const events = await listAdminEvents();

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

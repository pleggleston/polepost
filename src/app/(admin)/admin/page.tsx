import Link from 'next/link';
import { AdminAccessBlocked } from '@/components/admin/admin-access-blocked';
import { getAdminAccessContext, listAdminEvents, listModerationQueueEvents } from '@/lib/admin/moderation';

export default async function AdminPage() {
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

  let queueItems: Awaited<ReturnType<typeof listModerationQueueEvents>> = [];
  let allEvents: Awaited<ReturnType<typeof listAdminEvents>> = [];
  try {
    [queueItems, allEvents] = await Promise.all([listModerationQueueEvents(), listAdminEvents()]);
  } catch {
    return (
      <section className="space-y-4">
        <header className="rounded-xl border border-border bg-card p-4">
          <h1 className="text-lg font-semibold">Admin moderation</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use this area to review pending submissions and manage event moderation states.</p>
        </header>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Could not load moderation stats right now.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold">Admin moderation</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use this area to review pending submissions and manage event moderation states.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/moderation" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            Open moderation queue
          </Link>
          <Link href="/admin/events" className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
            View all events
          </Link>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Needs moderation" value={String(queueItems.length)} help="Events currently in pending_review/pending." />
        <StatCard label="Total admin-visible events" value={String(allEvents.length)} help="All events available to moderator/admin review." />
      </div>
    </section>
  );
}

function StatCard({ label, value, help }: { label: string; value: string; help: string }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{help}</p>
    </section>
  );
}

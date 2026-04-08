import Link from 'next/link';
import { AdminAccessBlocked } from '@/components/admin/admin-access-blocked';
import { AdminModerationQueue } from '@/components/admin/admin-moderation-queue';
import { getAdminAccessContext, listModerationQueueEvents } from '@/lib/admin/moderation';

export default async function AdminModerationPage() {
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

  let events: Awaited<ReturnType<typeof listModerationQueueEvents>> = [];
  try {
    events = await listModerationQueueEvents();
  } catch {
    return (
      <section className="space-y-4">
        <header className="rounded-xl border border-border bg-card p-4">
          <h1 className="text-lg font-semibold">Moderation queue</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review events in pending_review/pending state and apply an explicit moderation decision.</p>
        </header>
        <section className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Could not load moderation queue right now.
        </section>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold">Moderation queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review events in pending_review/pending state and apply an explicit moderation decision.</p>
        <Link href="/admin/events" className="mt-3 inline-flex rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
          View all admin events
        </Link>
      </header>

      <AdminModerationQueue events={events} />
    </section>
  );
}

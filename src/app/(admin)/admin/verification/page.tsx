import { AdminAccessBlocked } from '@/components/admin/admin-access-blocked';
import { AdminVerificationQueue } from '@/components/admin/admin-verification-queue';
import { getAdminAccessContext } from '@/lib/admin/moderation';
import { listPendingVerifications } from '@/lib/admin/verification';
import type { AppRole } from '@/lib/db/enums';

export default async function AdminVerificationPage() {
  const access = await getAdminAccessContext();

  if (!access.isAuthorized) {
    return <AdminAccessBlocked isAuthenticated={access.isAuthenticated} />;
  }

  // Verification queue is admin-only (not moderator)
  const isAdmin = access.role === ('admin' as AppRole);
  if (!isAdmin) {
    return (
      <section className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        21+ verification management is restricted to admins only.
      </section>
    );
  }

  let items: Awaited<ReturnType<typeof listPendingVerifications>> = [];
  try {
    items = await listPendingVerifications();
  } catch {
    return (
      <section className="space-y-4">
        <header className="rounded-xl border border-border bg-card p-4">
          <h1 className="text-lg font-semibold">21+ Verification queue</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and approve user age verification requests.</p>
        </header>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Could not load verification requests right now. Please refresh and try again.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold">21+ Verification queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review pending age verification requests. Approved users gain access to 21+ events.
        </p>
        {items.length > 0 ? (
          <p className="mt-2 text-sm font-medium">{items.length} pending {items.length === 1 ? 'request' : 'requests'}</p>
        ) : null}
      </header>

      <AdminVerificationQueue items={items} />
    </section>
  );
}

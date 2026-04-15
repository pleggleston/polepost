import { AdminAccessBlocked } from '@/components/admin/admin-access-blocked';
import { AdminActiveOrganizers } from '@/components/admin/admin-active-organizers';
import { AdminOrganizerApplications } from '@/components/admin/admin-organizer-applications';
import { getAdminAccessContext } from '@/lib/admin/moderation';
import { listActiveOrganizers, listPendingOrganizerApplications } from '@/lib/admin/organizers';

export default async function AdminOrganizersPage() {
  const access = await getAdminAccessContext();

  if (!access.isAuthorized) {
    return <AdminAccessBlocked isAuthenticated={access.isAuthenticated} />;
  }

  let applications: Awaited<ReturnType<typeof listPendingOrganizerApplications>> = [];
  let activeOrganizers: Awaited<ReturnType<typeof listActiveOrganizers>> = [];

  try {
    [applications, activeOrganizers] = await Promise.all([
      listPendingOrganizerApplications(),
      listActiveOrganizers()
    ]);
  } catch {
    return (
      <section className="space-y-4">
        <header className="rounded-xl border border-border bg-card p-4">
          <h1 className="text-lg font-semibold">Organizers</h1>
        </header>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Could not load organizer data right now. Please refresh and try again.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold">Organizers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review pending applications and manage active organizer accounts.
        </p>
      </header>

      {/* Pending applications */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Pending applications{applications.length > 0 ? ` (${applications.length})` : ''}
          </h2>
        </div>
        <AdminOrganizerApplications applications={applications} />
      </div>

      {/* Active organizers */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">
          Active organizers{activeOrganizers.length > 0 ? ` (${activeOrganizers.length})` : ''}
        </h2>
        <AdminActiveOrganizers organizers={activeOrganizers} />
      </div>
    </section>
  );
}

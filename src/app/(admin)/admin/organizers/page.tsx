import { AdminAccessBlocked } from '@/components/admin/admin-access-blocked';
import { AdminOrganizerApplications } from '@/components/admin/admin-organizer-applications';
import { getAdminAccessContext } from '@/lib/admin/moderation';
import { listPendingOrganizerApplications } from '@/lib/admin/organizers';

export default async function AdminOrganizersPage() {
  const access = await getAdminAccessContext();

  if (!access.isAuthorized) {
    return <AdminAccessBlocked isAuthenticated={access.isAuthenticated} />;
  }

  let applications: Awaited<ReturnType<typeof listPendingOrganizerApplications>> = [];
  try {
    applications = await listPendingOrganizerApplications();
  } catch {
    return (
      <section className="space-y-4">
        <header className="rounded-xl border border-border bg-card p-4">
          <h1 className="text-lg font-semibold">Organizer applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review pending organizer account requests.</p>
        </header>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Could not load applications right now. Please refresh and try again.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold">Organizer applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review pending organizer account requests. Approved organizers can submit events for moderation.
        </p>
        {applications.length > 0 ? (
          <p className="mt-2 text-sm font-medium">
            {applications.length} pending {applications.length === 1 ? 'application' : 'applications'}
          </p>
        ) : null}
      </header>

      <AdminOrganizerApplications applications={applications} />
    </section>
  );
}

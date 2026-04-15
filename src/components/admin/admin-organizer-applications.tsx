'use client';

import {
  approveOrganizerAction,
  denyOrganizerAction
} from '@/app/(admin)/admin/organizers/actions';
import type { OrganizerApplication } from '@/lib/admin/organizers';

type Props = { applications: OrganizerApplication[] };

export function AdminOrganizerApplications({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
        No pending organizer applications.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <ApplicationCard key={app.id} application={app} />
      ))}
    </div>
  );
}

function ApplicationCard({ application }: { application: OrganizerApplication }) {
  const ownerName =
    application.owner?.display_name ||
    application.owner?.username ||
    application.owner_profile_id;

  const appliedDate = new Date(application.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleApprove = async () => {
    await approveOrganizerAction(application.id, application.owner_profile_id);
  };

  const handleDeny = async () => {
    await denyOrganizerAction(application.id);
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="space-y-0.5">
        <p className="font-semibold">{application.name}</p>
        <p className="text-sm text-muted-foreground">Applied by {ownerName} · {appliedDate}</p>
        {application.bio ? (
          <p className="text-sm text-muted-foreground">{application.bio}</p>
        ) : null}
        {application.contact_email ? (
          <p className="text-xs text-muted-foreground">{application.contact_email}</p>
        ) : null}
        {application.instagram_url ? (
          <a
            href={application.instagram_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-primary hover:underline"
          >
            {application.instagram_url}
          </a>
        ) : null}
      </div>

      <div className="flex gap-2">
        <form action={handleApprove}>
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Approve
          </button>
        </form>
        <form action={handleDeny}>
          <button
            type="submit"
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            Deny
          </button>
        </form>
      </div>
    </div>
  );
}

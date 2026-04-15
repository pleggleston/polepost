'use client';

import { disableOrganizerAction } from '@/app/(admin)/admin/organizers/actions';
import type { ActiveOrganizer } from '@/lib/admin/organizers';

type Props = { organizers: ActiveOrganizer[] };

export function AdminActiveOrganizers({ organizers }: Props) {
  if (organizers.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
        No active organizers yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Owner</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Since</th>
            <th className="px-4 py-2 text-right font-medium text-muted-foreground">Action</th>
          </tr>
        </thead>
        <tbody>
          {organizers.map((org) => (
            <OrganizerRow key={org.id} organizer={org} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrganizerRow({ organizer }: { organizer: ActiveOrganizer }) {
  const ownerName =
    organizer.owner?.display_name ||
    organizer.owner?.username ||
    organizer.owner_profile_id.slice(0, 8);

  const since = new Date(organizer.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleDisable = async () => {
    await disableOrganizerAction(organizer.id, organizer.owner_profile_id);
  };

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium">{organizer.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{ownerName}</td>
      <td className="px-4 py-3 text-muted-foreground">{since}</td>
      <td className="px-4 py-3 text-right">
        <form action={handleDisable}>
          <button
            type="submit"
            className="rounded-md border border-input bg-background px-3 py-1 text-xs font-medium text-destructive hover:bg-muted"
          >
            Disable
          </button>
        </form>
      </td>
    </tr>
  );
}

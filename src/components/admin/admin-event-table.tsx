import Link from 'next/link';
import type { AdminEventRecord } from '@/lib/admin/moderation';

type AdminEventTableProps = {
  events: AdminEventRecord[];
};

export function AdminEventTable({ events }: AdminEventTableProps) {
  if (events.length === 0) {
    return <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">No events found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Starts</th>
            <th className="px-3 py-2">Visibility</th>
            <th className="px-3 py-2">Lifecycle</th>
            <th className="px-3 py-2">Moderation</th>
            <th className="px-3 py-2">Organizer</th>
            <th className="px-3 py-2">Updated</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-border/80 align-top">
              <td className="px-3 py-2">
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">{event.city}, {event.state}</p>
              </td>
              <td className="px-3 py-2">{new Date(event.starts_at).toLocaleString()}</td>
              <td className="px-3 py-2">{event.visibility}</td>
              <td className="px-3 py-2">{event.lifecycle_status}</td>
              <td className="px-3 py-2">{event.moderation_status}</td>
              <td className="px-3 py-2">
                <p>{event.organizer?.name ?? 'Unknown organizer'}</p>
                <p className="text-xs text-muted-foreground">owner: {event.organizer?.owner_profile_id ?? 'n/a'}</p>
              </td>
              <td className="px-3 py-2">
                <p>{new Date(event.updated_at).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">created: {new Date(event.created_at).toLocaleString()}</p>
              </td>
              <td className="px-3 py-2">
                {event.moderation_status === 'pending_review' && event.lifecycle_status === 'pending' ? (
                  <Link href={`/admin/moderation#event-${event.id}`} className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted">
                    Review
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">No action</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

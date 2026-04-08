import Link from 'next/link';
import type { OrganizerEventListItem } from '@/lib/organizer/queries';

type OrganizerEventListProps = {
  events: OrganizerEventListItem[];
};

export function OrganizerEventList({ events }: OrganizerEventListProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        You have not created any events yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <article key={event.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">{event.title}</h2>
              <p className="text-xs text-muted-foreground">Starts: {new Date(event.starts_at).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                Lifecycle: <span className="font-medium text-foreground">{event.lifecycle_status}</span> · Moderation:{' '}
                <span className="font-medium text-foreground">{event.moderation_status}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Created: {new Date(event.created_at).toLocaleString()} · Updated: {new Date(event.updated_at).toLocaleString()}
              </p>
            </div>

            <Link href={`/organizer/events/${event.id}/edit`} className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
              Edit
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

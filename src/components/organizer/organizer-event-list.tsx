import Link from 'next/link';
import type { ModerationStatus, EventLifecycleStatus } from '@/lib/db/enums';
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
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function EventCard({ event }: { event: OrganizerEventListItem }) {
  const isRejected = event.lifecycle_status === 'rejected';
  const isFlagged = event.lifecycle_status === 'flagged';
  const isPending = event.lifecycle_status === 'pending' || event.lifecycle_status === 'draft';
  const isApproved = event.lifecycle_status === 'approved';
  const canEdit = isRejected || isFlagged || isPending;

  return (
    <article className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h2 className="text-base font-semibold text-foreground truncate">{event.title}</h2>
          <p className="text-xs text-muted-foreground">
            Starts: {new Date(event.starts_at).toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <StatusBadge lifecycle={event.lifecycle_status} moderation={event.moderation_status} />
          </div>
        </div>

        {canEdit ? (
          <Link
            href={`/organizer/events/${event.id}/edit`}
            className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            {isRejected || isFlagged ? 'Edit & resubmit' : 'Edit'}
          </Link>
        ) : isApproved ? (
          <Link
            href={`/organizer/events/${event.id}/edit`}
            className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Edit
          </Link>
        ) : null}
      </div>

      {/* Rejection / flag reason */}
      {(isRejected || isFlagged) && event.moderation_reason ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
          <p className="font-medium text-destructive">
            {isRejected ? 'Rejection reason' : 'Flag reason'}
          </p>
          <p className="mt-0.5 text-muted-foreground">{event.moderation_reason}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Edit the event to address this feedback, then resubmit for review.
          </p>
        </div>
      ) : (isRejected || isFlagged) ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
          <p className="font-medium text-destructive">
            {isRejected ? 'Event rejected' : 'Event flagged'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Edit the event and resubmit for another review.
          </p>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Updated: {new Date(event.updated_at).toLocaleString()}
      </p>
    </article>
  );
}

function StatusBadge({
  lifecycle,
  moderation
}: {
  lifecycle: EventLifecycleStatus;
  moderation: ModerationStatus;
}) {
  const lifecycleStyle: Record<EventLifecycleStatus, string> = {
    draft: 'bg-muted text-muted-foreground',
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-destructive/10 text-destructive',
    flagged: 'bg-orange-100 text-orange-800',
    expired: 'bg-muted text-muted-foreground'
  };

  const moderationStyle: Record<ModerationStatus, string> = {
    pending_review: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-destructive/10 text-destructive',
    flagged: 'bg-orange-100 text-orange-800'
  };

  return (
    <>
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${lifecycleStyle[lifecycle]}`}>
        {lifecycle.replace('_', ' ')}
      </span>
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${moderationStyle[moderation]}`}>
        {moderation.replace('_', ' ')}
      </span>
    </>
  );
}

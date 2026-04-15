import Image from 'next/image';
import type { AdminEventRecord } from '@/lib/admin/moderation';
import { ModerationActions } from './moderation-actions';

type AdminModerationQueueProps = {
  events: AdminEventRecord[];
};

export function AdminModerationQueue({ events }: AdminModerationQueueProps) {
  if (events.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Moderation queue is clear. No events are currently in <span className="font-medium">pending_review/pending</span> state.
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <article id={`event-${event.id}`} key={event.id} className="rounded-xl border border-border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_280px]">
            <div className="space-y-2">
              <h2 className="text-base font-semibold">{event.title}</h2>
              <p className="text-sm text-muted-foreground">{event.description}</p>
              <p className="text-sm">{event.venue_name} · {event.city}, {event.state}</p>
              <p className="text-sm">Starts: {new Date(event.starts_at).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                organizer: {event.organizer?.name ?? 'Unknown'} ({event.organizer?.owner_profile_id ?? 'n/a'})
              </p>
              <p className="text-xs text-muted-foreground">
                status: {event.moderation_status}/{event.lifecycle_status} · updated {new Date(event.updated_at).toLocaleString()}
              </p>
            </div>

            <div className="space-y-3">
              {event.flyer_url ? (
                <Image
                  src={event.flyer_url}
                  alt={`${event.title} flyer`}
                  width={560}
                  height={720}
                  className="w-full rounded-md border border-border object-cover"
                />
              ) : (
                <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                  Flyer URL unavailable. Stored path: {event.flyer_path}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <ModerationActions eventId={event.id} />
          </div>
        </article>
      ))}
    </div>
  );
}

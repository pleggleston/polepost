import Link from 'next/link';
import { OrganizerAccessBlocked } from '@/components/organizer/organizer-access-blocked';
import { listOwnedEvents, getOrganizerContext } from '@/lib/organizer/queries';
import type { EventLifecycleStatus } from '@/lib/db/enums';

export default async function OrganizerHomePage() {
  let organizerContext: Awaited<ReturnType<typeof getOrganizerContext>>;
  try {
    organizerContext = await getOrganizerContext();
  } catch {
    return (
      <section className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Could not load organizer access right now. Please refresh and try again.
      </section>
    );
  }

  if (!organizerContext.hasOrganizerAccess || !organizerContext.organizerId) {
    return <OrganizerAccessBlocked />;
  }

  let events: Awaited<ReturnType<typeof listOwnedEvents>> = [];
  try {
    events = await listOwnedEvents(organizerContext.organizerId);
  } catch {
    return (
      <section className="space-y-4">
        <header className="rounded-xl border border-border bg-card p-4">
          <h1 className="text-lg font-semibold">Organizer dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {organizerContext.organizerName ?? 'Organizer'}.</p>
        </header>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Could not load your current submissions right now.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold">Organizer dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Signed in as {organizerContext.organizerName ?? 'Organizer'}.</p>
        <div className="mt-4 flex gap-2">
          <Link href="/organizer/events/new" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            Create new event
          </Link>
          <Link href="/organizer/events" className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
            View my events
          </Link>
        </div>
      </header>

      <EventStatsGrid events={events} />
    </section>
  );
}

type StatEvent = { lifecycle_status: EventLifecycleStatus };

const STATUS_CONFIG: Array<{
  key: EventLifecycleStatus;
  label: string;
  style: string;
}> = [
  { key: 'approved', label: 'Approved',  style: 'bg-emerald-100 text-emerald-800' },
  { key: 'pending',  label: 'Pending',   style: 'bg-amber-100 text-amber-800' },
  { key: 'flagged',  label: 'Flagged',   style: 'bg-orange-100 text-orange-800' },
  { key: 'rejected', label: 'Rejected',  style: 'bg-destructive/10 text-destructive' },
  { key: 'draft',    label: 'Draft',     style: 'bg-muted text-muted-foreground' },
  { key: 'expired',  label: 'Expired',   style: 'bg-muted text-muted-foreground' },
];

function EventStatsGrid({ events }: { events: StatEvent[] }) {
  const counts = Object.fromEntries(
    STATUS_CONFIG.map(({ key }) => [key, events.filter(e => e.lifecycle_status === key).length])
  ) as Record<EventLifecycleStatus, number>;

  const visibleStats = STATUS_CONFIG.filter(({ key }) => counts[key] > 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Submissions{events.length > 0 ? ` (${events.length})` : ''}
        </h2>
        <Link href="/organizer/events" className="text-xs text-muted-foreground hover:underline">
          View all →
        </Link>
      </div>

      {visibleStats.length === 0 ? (
        <p className="text-sm text-muted-foreground">No event submissions yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {visibleStats.map(({ key, label, style }) => (
            <span key={key} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${style}`}>
              <span className="tabular-nums font-semibold">{counts[key]}</span>
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

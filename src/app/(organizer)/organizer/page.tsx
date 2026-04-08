import Link from 'next/link';
import { OrganizerAccessBlocked } from '@/components/organizer/organizer-access-blocked';
import { listOwnedEvents, getOrganizerContext } from '@/lib/organizer/queries';

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

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Current submissions</h2>
        <p className="mt-1 text-sm text-muted-foreground">You currently have {events.length} event submissions.</p>
      </div>
    </section>
  );
}

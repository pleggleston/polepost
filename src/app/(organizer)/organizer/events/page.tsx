import Link from 'next/link';
import { OrganizerAccessBlocked } from '@/components/organizer/organizer-access-blocked';
import { OrganizerEventList } from '@/components/organizer/organizer-event-list';
import { getOrganizerContext, listOwnedEvents } from '@/lib/organizer/queries';

export default async function OrganizerEventsPage() {
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
        <header className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">My events</h1>
          <Link href="/organizer/events/new" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            New event
          </Link>
        </header>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Could not load your organizer events right now.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">My events</h1>
        <Link href="/organizer/events/new" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
          New event
        </Link>
      </header>
      <OrganizerEventList events={events} />
    </section>
  );
}

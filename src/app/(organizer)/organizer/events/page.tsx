import Link from 'next/link';
import { OrganizerAccessBlocked } from '@/components/organizer/organizer-access-blocked';
import { OrganizerEventList } from '@/components/organizer/organizer-event-list';
import { getOrganizerContext, listOwnedEvents } from '@/lib/organizer/queries';

export default async function OrganizerEventsPage() {
  const organizerContext = await getOrganizerContext();

  if (!organizerContext.hasOrganizerAccess || !organizerContext.organizerId) {
    return <OrganizerAccessBlocked />;
  }

  const events = await listOwnedEvents(organizerContext.organizerId);

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

import Link from 'next/link';
import { OrganizerAccessBlocked } from '@/components/organizer/organizer-access-blocked';
import { OrganizerEventForm } from '@/components/organizer/organizer-event-form';
import { createOrganizerEvent } from '../actions';
import { getOrganizerContext, listOrganizerCategories } from '@/lib/organizer/queries';

export default async function OrganizerNewEventPage() {
  const organizerContext = await getOrganizerContext();

  if (!organizerContext.hasOrganizerAccess) {
    return <OrganizerAccessBlocked />;
  }

  const categories = await listOrganizerCategories();

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-lg font-semibold">Create event</h1>
        <p className="text-sm text-muted-foreground">All organizer submissions are sent back through moderation review.</p>
        <Link href="/organizer/events" className="inline-flex text-sm text-primary underline-offset-4 hover:underline">
          Back to my events
        </Link>
      </header>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No active categories are available yet. Ask an admin to enable an event category before creating events.
        </div>
      ) : (
        <OrganizerEventForm mode="create" categories={categories} submitAction={createOrganizerEvent} />
      )}
    </section>
  );
}

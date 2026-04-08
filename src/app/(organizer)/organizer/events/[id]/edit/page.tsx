import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrganizerAccessBlocked } from '@/components/organizer/organizer-access-blocked';
import { OrganizerEventForm } from '@/components/organizer/organizer-event-form';
import { updateOrganizerEvent } from '../../actions';
import { getOrganizerContext, getOwnedEventForEdit, listOrganizerCategories } from '@/lib/organizer/queries';

export default async function OrganizerEditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const organizerContext = await getOrganizerContext();

  if (!organizerContext.hasOrganizerAccess || !organizerContext.organizerId) {
    return <OrganizerAccessBlocked />;
  }

  const [categories, event] = await Promise.all([
    listOrganizerCategories(),
    getOwnedEventForEdit(id, organizerContext.organizerId)
  ]);

  if (!event) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-lg font-semibold">Edit event</h1>
        <p className="text-sm text-muted-foreground">
          Updating an event sends it back to moderation as pending review.
        </p>
        <Link href="/organizer/events" className="inline-flex text-sm text-primary underline-offset-4 hover:underline">
          Back to my events
        </Link>
      </header>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No active categories are available yet. Ask an admin to enable an event category before editing events.
        </div>
      ) : (
        <OrganizerEventForm
          mode="edit"
          categories={categories}
          initialValues={event}
          submitAction={updateOrganizerEvent.bind(null, event.id)}
        />
      )}
    </section>
  );
}

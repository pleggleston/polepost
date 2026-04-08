import { PoleEmptyState } from '@/components/pole/pole-empty-state';
import { PoleFeed } from '@/components/pole/pole-feed';
import type { PoleEvent } from '@/components/pole/types';
import { listPublicEvents } from '@/lib/events/public-events';

function toPoleEvents(events: Awaited<ReturnType<typeof listPublicEvents>>): PoleEvent[] {
  return events
    .filter((event) => Boolean(event.id && event.slug && event.title && event.starts_at))
    .map((event) => ({
      id: event.id,
      slug: event.slug,
      title: event.title,
      flyer_url: event.flyer_url,
      starts_at: event.starts_at,
      timezone: event.timezone,
      city: event.city,
      state: event.state,
      venue_name: event.venue_name,
      category_label: event.category?.label ?? null
    }));
}

export default async function PolePage() {
  try {
    const events = await listPublicEvents();
    const poleEvents = toPoleEvents(events);

    if (poleEvents.length === 0) {
      return <PoleEmptyState title="No events in the Pole" description="There are no approved upcoming public events to swipe right now." />;
    }

    return (
      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">The Pole</h2>
          <p className="text-sm text-muted-foreground">Swipe through upcoming public events.</p>
        </div>
        <PoleFeed events={poleEvents} />
      </section>
    );
  } catch {
    return <PoleEmptyState title="Could not load The Pole" description="We could not load the swipe feed right now. Please try again soon." />;
  }
}

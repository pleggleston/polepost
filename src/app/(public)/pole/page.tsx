import { PoleFeed } from '@/components/pole/pole-feed';
import type { PoleEvent } from '@/components/pole/types';
import { listPublicEvents } from '@/lib/events/public-events';

function mapToPoleEvent(event: Awaited<ReturnType<typeof listPublicEvents>>[number]): PoleEvent {
  return {
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
  };
}

export default async function PolePage() {
  const events = await listPublicEvents();
  const poleEvents = events.map(mapToPoleEvent);

  return (
    <section className="fixed inset-0 isolate overflow-hidden">
      <div className="fixed inset-0 bg-[url('/pole-bg.png')] bg-cover bg-center bg-no-repeat" />

      <div className="pointer-events-none absolute left-1/2 top-[42vh] w-[72vw] max-w-[348px] -translate-x-1/2 -translate-y-1/2 sm:w-[66vw]">
        <div className="pointer-events-auto aspect-[3/4] w-full">
          <PoleFeed events={poleEvents} />
        </div>
      </div>
    </section>
  );
}

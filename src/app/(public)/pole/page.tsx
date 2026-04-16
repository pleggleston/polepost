import type { ReactNode } from 'react';
import { PoleEmptyState } from '@/components/pole/pole-empty-state';
import { PoleFeed } from '@/components/pole/pole-feed';
import type { PoleEvent } from '@/components/pole/types';
import { listPublicEvents } from '@/lib/events/public-events';

type ListedEvent = Awaited<ReturnType<typeof listPublicEvents>>['events'][number];

function mapToPoleEvent(event: ListedEvent): PoleEvent {
  const safeId = typeof event.id === 'string' && event.id.length > 0 ? event.id : `event-${Math.random().toString(16).slice(2)}`;
  const safeSlug = typeof event.slug === 'string' ? event.slug : '';
  const safeTitle = typeof event.title === 'string' ? event.title : 'Untitled event';
  const safeFlyerUrl = typeof event.flyer_url === 'string' ? event.flyer_url : null;
  const safeStartsAt = typeof event.starts_at === 'string' ? event.starts_at : '';
  const safeTimezone = typeof event.timezone === 'string' ? event.timezone : 'UTC';
  const safeCity = typeof event.city === 'string' ? event.city : '';
  const safeState = typeof event.state === 'string' ? event.state : '';
  const safeVenueName = typeof event.venue_name === 'string' ? event.venue_name : '';
  const safeCategoryLabel = typeof event.category?.label === 'string' ? event.category.label : null;

  return {
    id: safeId,
    slug: safeSlug,
    title: safeTitle,
    flyer_url: safeFlyerUrl,
    starts_at: safeStartsAt,
    timezone: safeTimezone,
    city: safeCity,
    state: safeState,
    venue_name: safeVenueName,
    category_label: safeCategoryLabel
  };
}

function renderPoleShell(content: ReactNode) {
  return (
    <section className="fixed inset-0 isolate overflow-hidden">
      <div className="fixed inset-0 bg-[url('/pole-bg.png')] bg-cover bg-center bg-no-repeat" />

      <div className="pointer-events-none absolute left-1/2 top-[42vh] w-[72vw] max-w-[348px] -translate-x-1/2 -translate-y-1/2 sm:w-[66vw]">
        <div className="pointer-events-auto aspect-[3/4] w-full">{content}</div>
      </div>
    </section>
  );
}

export default async function PolePage() {
  try {
    const { events } = await listPublicEvents();
    const poleEvents = events.map(mapToPoleEvent);

    if (poleEvents.length === 0) {
      return renderPoleShell(<PoleEmptyState title="No public events yet" description="Approved upcoming events will appear here when they are published." />);
    }

    return renderPoleShell(<PoleFeed events={poleEvents} />);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[PolePage] Failed to load public events for /pole.', {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
    } else {
      console.error('[PolePage] Failed to load public events for /pole with non-Error value.', {
        error
      });
    }

    return renderPoleShell(
      <PoleEmptyState
        title="Events are temporarily unavailable"
        description="We could not load Pole events right now. Please try again shortly."
      />
    );
  }
}

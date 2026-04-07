import type { PublicEvent } from '@/lib/events/public-events';
import { EventCard } from './event-card';

export function EventList({ events }: { events: PublicEvent[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

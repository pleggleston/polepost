import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import type { PoleEvent } from './types';

function formatDateTime(startsAt: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
    timeZoneName: 'short'
  }).format(new Date(startsAt));
}

export function PoleCard({ event }: { event: PoleEvent }) {
  const eventHref = `/events/${event.slug}` as Route;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <Link href={eventHref} className="block">
        {event.flyer_url ? (
          <Image src={event.flyer_url} alt={`Flyer for ${event.title}`} width={1200} height={1600} unoptimized className="h-[22rem] w-full object-cover" />
        ) : (
          <div className="flex h-[22rem] items-center justify-center bg-muted text-sm text-muted-foreground">Flyer coming soon</div>
        )}
      </Link>

      <div className="space-y-2 p-4">
        <p className="text-xs text-muted-foreground">{formatDateTime(event.starts_at, event.timezone)}</p>
        <Link href={eventHref} className="block text-xl font-semibold leading-tight hover:underline">
          {event.title}
        </Link>
        <p className="text-sm text-muted-foreground">{event.venue_name || `${event.city}, ${event.state}`}</p>
        {event.venue_name ? <p className="text-sm text-muted-foreground">{event.city}, {event.state}</p> : null}
        {event.category_label ? <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{event.category_label}</p> : null}
      </div>
    </article>
  );
}

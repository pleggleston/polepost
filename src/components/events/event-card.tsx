import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import type { PublicEvent } from '@/lib/events/public-events';
import { EventMeta } from './event-meta';

export function EventCard({ event }: { event: PublicEvent }) {
  const eventHref = `/events/${event.slug}` as Route;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-white">
      <Link href={eventHref} className="block">
        {event.flyer_url ? (
          <div className="relative h-48 w-full">
            <Image src={event.flyer_url} alt={`Flyer for ${event.title}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-muted text-sm text-muted-foreground">Flyer coming soon</div>
        )}
      </Link>
      <div className="space-y-3 p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {event.category?.label ? <span className="rounded-full bg-muted px-2 py-1">{event.category.label}</span> : null}
            <span className="rounded-full bg-muted px-2 py-1 capitalize">{event.visibility}</span>
          </div>
          <Link href={eventHref} className="block text-lg font-semibold leading-tight hover:underline">
            {event.title}
          </Link>
        </div>
        <EventMeta event={event} />
      </div>
    </article>
  );
}

import Link from 'next/link';
import type { Route } from 'next';
import type { PoleEvent } from './types';

const DEFAULT_TIMEZONE = 'UTC';

function createDateFormatter(timeZone?: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...(timeZone ? { timeZone } : {})
  });
}

function formatDateTime(startsAt: string, timezone: string): string {
  const parsedDate = new Date(startsAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date TBD';
  }

  try {
    return createDateFormatter(timezone).format(parsedDate);
  } catch {
    try {
      return createDateFormatter(DEFAULT_TIMEZONE).format(parsedDate);
    } catch {
      return createDateFormatter().format(parsedDate);
    }
  }
}

export function PoleCard({ event }: { event: PoleEvent }) {
  const hasSlug = typeof event.slug === 'string' && event.slug.length > 0;
  const eventHref = hasSlug ? (`/events/${event.slug}` as Route) : ('/events' as Route);
  const title = typeof event.title === 'string' && event.title.trim().length > 0 ? event.title : 'Untitled event';
  const hasFlyerUrl = typeof event.flyer_url === 'string' && event.flyer_url.length > 0;
  const flyerUrl = hasFlyerUrl ? event.flyer_url : undefined;
  const formattedDate = formatDateTime(event.starts_at, event.timezone);

  return (
    <article className="h-full overflow-hidden rounded-md border border-black/15 bg-white/80 shadow-[0_18px_34px_rgba(0,0,0,0.32)] backdrop-blur-[1px]">
      <Link href={eventHref} className="relative block h-full w-full">
        {flyerUrl ? (
          <img src={flyerUrl} alt={`Flyer for ${title}`} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-100 text-sm text-zinc-600">Flyer coming soon</div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-white">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-white/85">{formattedDate}</p>
        </div>
      </Link>
    </article>
  );
}

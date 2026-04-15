import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarActions } from '@/components/events/calendar-actions';
import { EmptyState } from '@/components/events/empty-state';
import { EventMeta } from '@/components/events/event-meta';
import { SaveEventButton } from '@/components/events/save-event-button';
import { getCurrentUser } from '@/lib/auth/session';
import { getPublicEventBySlug } from '@/lib/events/public-events';
import { isEventSavedForProfile } from '@/lib/events/saved-events';

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;

  let event: Awaited<ReturnType<typeof getPublicEventBySlug>>;
  try {
    event = await getPublicEventBySlug(slug);
  } catch {
    return (
      <EmptyState
        title="Event details unavailable"
        description="We could not load this public event right now."
        ctaLabel="Back to browse"
        ctaHref="/browse"
      />
    );
  }

  if (!event) {
    notFound();
  }

  const user = await getCurrentUser();

  let isSaved = false;
  if (user) {
    try {
      isSaved = await isEventSavedForProfile(user.id, event.id);
    } catch {
      isSaved = false;
    }
  }

  return (
    <article className="space-y-5">
      <Link href="/browse" className="text-sm font-medium text-primary hover:underline">
        ← Back to browse
      </Link>

      {event.flyer_url ? (
        <Image
          src={event.flyer_url}
          alt={`Flyer for ${event.title}`}
          width={1200}
          height={1600}
          className="h-auto w-full rounded-xl border border-border object-cover"
        />
      ) : (
        <div className="flex h-56 items-center justify-center rounded-xl border border-border bg-muted text-sm text-muted-foreground">No flyer uploaded</div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {event.category?.label ? <span className="rounded-full bg-muted px-2 py-1">{event.category.label}</span> : null}
          <span className="rounded-full bg-muted px-2 py-1 capitalize">{event.visibility}</span>
        </div>

        <h1 className="text-2xl font-bold leading-tight">{event.title}</h1>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{event.description}</p>
      </div>

      <section className="space-y-3 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Actions</h2>
        <SaveEventButton eventId={event.id} initialSaved={isSaved} isAuthenticated={Boolean(user)} />
        <CalendarActions event={event} />
      </section>

      <section className="space-y-2 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Event details</h2>
        <EventMeta event={event} />
        {event.address_line1 ? <p className="text-sm text-muted-foreground">{event.address_line1}</p> : null}
        {event.external_url ? (
          <a href={event.external_url} target="_blank" rel="noreferrer" className="inline-flex text-sm font-medium text-primary hover:underline">
            Open official event link
          </a>
        ) : null}
      </section>
    </article>
  );
}

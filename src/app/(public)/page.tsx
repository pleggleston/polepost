import Link from 'next/link';
import { EmptyState } from '@/components/events/empty-state';
import { EventList } from '@/components/events/event-list';
import { getFeaturedPublicEvents } from '@/lib/events/public-events';

export default async function HomePage() {
  let featuredEvents = [];

  try {
    featuredEvents = await getFeaturedPublicEvents(3);
  } catch {
    return (
      <div className="space-y-8">
        <section className="space-y-3 rounded-xl bg-primary/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">PolePost</p>
          <h2 className="text-3xl font-bold leading-tight">Discover local events from real flyers.</h2>
          <p className="text-sm text-muted-foreground">Browse approved, public upcoming events in your city.</p>
          <Link href="/browse" className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Browse events
          </Link>
        </section>

        <EmptyState
          title="Events are temporarily unavailable"
          description="We could not load public events right now. Please try again shortly."
          ctaLabel="Go to browse"
          ctaHref="/browse"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3 rounded-xl bg-primary/10 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">PolePost</p>
        <h2 className="text-3xl font-bold leading-tight">Discover local events from real flyers.</h2>
        <p className="text-sm text-muted-foreground">Browse approved, public upcoming events in your city.</p>
        <Link href="/browse" className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Browse events
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Upcoming this week</h3>
          <Link href="/browse" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        {featuredEvents.length > 0 ? (
          <EventList events={featuredEvents} />
        ) : (
          <EmptyState
            title="No public events yet"
            description="As soon as organizers publish approved events, they will appear here."
            ctaLabel="Explore browse"
            ctaHref="/browse"
          />
        )}
      </section>
    </div>
  );
}

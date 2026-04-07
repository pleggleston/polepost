import Link from 'next/link';
import { EmptyState } from '@/components/events/empty-state';
import { EventList } from '@/components/events/event-list';
import { getFeaturedPublicEvents } from '@/lib/events/public-events';

export default async function HomePage() {
  const featuredEvents = await getFeaturedPublicEvents(3);

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

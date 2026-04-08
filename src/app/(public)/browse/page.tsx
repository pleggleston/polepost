import { EmptyState } from '@/components/events/empty-state';
import { EventList } from '@/components/events/event-list';
import { FilterBar } from '@/components/events/filter-bar';
import { listPublicCategories, listPublicEvents, normalizePublicEventFilters, type PublicEventQueryParams } from '@/lib/events/public-events';

type BrowsePageProps = {
  searchParams: Promise<PublicEventQueryParams>;
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const filters = normalizePublicEventFilters(params);
  const hasActiveFilters = Boolean(filters.city || filters.category || filters.datePreset);

  try {
    const [events, categories] = await Promise.all([
      listPublicEvents(filters),
      listPublicCategories()
    ]);

    return (
      <div className="space-y-4">
        <section className="space-y-1">
          <h2 className="text-2xl font-bold">Browse events</h2>
          <p className="text-sm text-muted-foreground">Public, approved, upcoming events only.</p>
        </section>

        <FilterBar city={filters.city} category={filters.category} datePreset={filters.datePreset} categories={categories} />

        {events.length > 0 ? (
          <EventList events={events} />
        ) : (
          <EmptyState
            title="No matching events"
            description={
              hasActiveFilters
                ? 'Try a broader city/category/date selection, or clear all filters to see every approved upcoming event.'
                : 'There are no approved upcoming public events yet. Check back soon.'
            }
            ctaLabel={hasActiveFilters ? 'Clear filters' : 'Back home'}
            ctaHref={hasActiveFilters ? '/browse' : '/'}
          />
        )}
      </div>
    );
  } catch {
    return (
      <div className="space-y-4">
        <section className="space-y-1">
          <h2 className="text-2xl font-bold">Browse events</h2>
          <p className="text-sm text-muted-foreground">Public, approved, upcoming events only.</p>
        </section>

        <EmptyState
          title="Could not load events"
          description="Public events are temporarily unavailable. Please try again in a moment."
          ctaLabel="Back home"
          ctaHref="/"
        />
      </div>
    );
  }
}

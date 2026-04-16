import Link from 'next/link';
import { EmptyState } from '@/components/events/empty-state';
import { EventList } from '@/components/events/event-list';
import { FilterBar } from '@/components/events/filter-bar';
import { listPublicCategories, listPublicEvents, normalizePublicEventFilters, PAGE_SIZE, type PublicEventQueryParams } from '@/lib/events/public-events';

type BrowsePageProps = {
  searchParams: Promise<PublicEventQueryParams>;
};

function buildPageHref(filters: ReturnType<typeof normalizePublicEventFilters>, p: number): string {
  const sp = new URLSearchParams();
  if (filters.city) sp.set('city', filters.city);
  if (filters.category) sp.set('category', filters.category);
  if (filters.datePreset) sp.set('date', filters.datePreset);
  if (filters.search) sp.set('search', filters.search);
  if (p > 1) sp.set('page', String(p));
  const qs = sp.toString();
  return qs ? `/browse?${qs}` : '/browse';
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const filters = normalizePublicEventFilters(params);
  const page = Math.max(1, Number(params.page) || 1);
  const hasActiveFilters = Boolean(filters.city || filters.category || filters.datePreset || filters.search);

  try {
    const [{ events, total }, categories] = await Promise.all([
      listPublicEvents({ ...filters, page }),
      listPublicCategories()
    ]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
      <div className="space-y-4">
        <section className="space-y-1">
          <h2 className="text-2xl font-bold">Browse events</h2>
          <p className="text-sm text-muted-foreground">Public, approved, upcoming events only.</p>
        </section>

        <FilterBar city={filters.city} category={filters.category} datePreset={filters.datePreset} search={filters.search} categories={categories} />

        {events.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              {total} event{total !== 1 ? 's' : ''} found
              {hasActiveFilters ? ' matching your filters' : ''}
            </p>
            <EventList events={events} />
            {totalPages > 1 && (
              <nav className="flex items-center justify-between text-sm">
                {page > 1
                  ? <Link href={buildPageHref(filters, page - 1)} className="rounded-md border border-border px-3 py-2">← Previous</Link>
                  : <span />}
                <span className="text-muted-foreground">Page {page} of {totalPages}</span>
                {page < totalPages
                  ? <Link href={buildPageHref(filters, page + 1)} className="rounded-md border border-border px-3 py-2">Next →</Link>
                  : <span />}
              </nav>
            )}
          </div>
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

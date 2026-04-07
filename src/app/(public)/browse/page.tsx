import { EmptyState } from '@/components/events/empty-state';
import { EventList } from '@/components/events/event-list';
import { FilterBar } from '@/components/events/filter-bar';
import { DATE_PRESETS, listPublicCategories, listPublicEvents, type DatePreset } from '@/lib/events/public-events';

type BrowsePageProps = {
  searchParams: Promise<{
    city?: string;
    category?: string;
    date?: string;
  }>;
};

function parseDatePreset(value?: string): DatePreset | undefined {
  if (value && DATE_PRESETS.includes(value as DatePreset)) {
    return value as DatePreset;
  }

  return undefined;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const datePreset = parseDatePreset(params.date);

  const [events, categories] = await Promise.all([
    listPublicEvents({ city: params.city, category: params.category, datePreset }),
    listPublicCategories()
  ]);

  return (
    <div className="space-y-4">
      <section className="space-y-1">
        <h2 className="text-2xl font-bold">Browse events</h2>
        <p className="text-sm text-muted-foreground">Public, approved, upcoming events only.</p>
      </section>

      <FilterBar city={params.city} category={params.category} datePreset={datePreset} categories={categories} />

      {events.length > 0 ? (
        <EventList events={events} />
      ) : (
        <EmptyState
          title="No matching events"
          description="Try clearing one or more filters to see more upcoming events."
          ctaLabel="Reset filters"
          ctaHref="/browse"
        />
      )}
    </div>
  );
}

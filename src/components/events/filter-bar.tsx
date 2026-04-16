import { DATE_PRESETS, type DatePreset, type PublicCategory } from '@/lib/events/public-events';

type FilterBarProps = {
  city?: string;
  category?: string;
  datePreset?: DatePreset;
  search?: string;
  categories: PublicCategory[];
};

export function FilterBar({ city, category, datePreset, search, categories }: FilterBarProps) {
  return (
    <form className="space-y-3 rounded-xl border border-border bg-white p-3" action="/browse" method="get">
      <div className="grid gap-1">
        <label htmlFor="search-filter" className="text-xs font-medium text-muted-foreground">Search</label>
        <input
          id="search-filter"
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Event title or venue…"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <div className="grid gap-1">
        <label htmlFor="city-filter" className="text-xs font-medium text-muted-foreground">
          City
        </label>
        <input
          id="city-filter"
          type="text"
          name="city"
          defaultValue={city}
          placeholder="e.g. Los Angeles"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-1">
        <label htmlFor="category-filter" className="text-xs font-medium text-muted-foreground">
          Category
        </label>
        <select id="category-filter" name="category" defaultValue={category ?? ''} className="rounded-md border border-border px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1">
        <label htmlFor="date-filter" className="text-xs font-medium text-muted-foreground">
          Date
        </label>
        <select id="date-filter" name="date" defaultValue={datePreset ?? ''} className="rounded-md border border-border px-3 py-2 text-sm">
          <option value="">Any date</option>
          {DATE_PRESETS.map((preset) => (
            <option key={preset} value={preset}>
              {formatDatePresetLabel(preset)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
          Apply
        </button>
        <a href="/browse" className="flex-1 rounded-md border border-border px-3 py-2 text-center text-sm">
          Reset
        </a>
      </div>
      </div>
    </form>
  );
}

function formatDatePresetLabel(preset: DatePreset) {
  if (preset === 'today') return 'Today';
  if (preset === 'this_week') return 'This week';
  return 'This weekend';
}

import { DATE_PRESETS, type DatePreset, type PublicCategory } from '@/lib/events/public-events';

type FilterBarProps = {
  city?: string;
  category?: string;
  datePreset?: DatePreset;
  categories: PublicCategory[];
};

export function FilterBar({ city, category, datePreset, categories }: FilterBarProps) {
  return (
    <form className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-white p-3 md:grid-cols-4" action="/browse" method="get">
      <input
        type="text"
        name="city"
        defaultValue={city}
        placeholder="Filter by city"
        className="rounded-md border border-border px-3 py-2 text-sm"
      />
      <select name="category" defaultValue={category ?? ''} className="rounded-md border border-border px-3 py-2 text-sm">
        <option value="">All categories</option>
        {categories.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.label}
          </option>
        ))}
      </select>
      <select name="date" defaultValue={datePreset ?? ''} className="rounded-md border border-border px-3 py-2 text-sm">
        <option value="">Any date</option>
        {DATE_PRESETS.map((preset) => (
          <option key={preset} value={preset}>
            {preset.replace('_', ' ')}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
          Apply
        </button>
        <a href="/browse" className="flex-1 rounded-md border border-border px-3 py-2 text-center text-sm">
          Reset
        </a>
      </div>
    </form>
  );
}

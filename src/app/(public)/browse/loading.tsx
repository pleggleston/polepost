export default function BrowseLoading() {
  return (
    <section className="space-y-3">
      <p className="text-sm text-muted-foreground">Loading public events…</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-60 animate-pulse rounded-xl border border-border bg-muted" />
        ))}
      </div>
    </section>
  );
}

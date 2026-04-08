export default function EventDetailLoading() {
  return (
    <section className="space-y-3">
      <p className="text-sm text-muted-foreground">Loading event details…</p>
      <div className="h-64 animate-pulse rounded-xl border border-border bg-muted" />
      <div className="h-24 animate-pulse rounded-xl border border-border bg-muted" />
    </section>
  );
}

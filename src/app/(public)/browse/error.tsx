'use client';

export default function BrowseError() {
  return (
    <section className="rounded-xl border border-border p-4">
      <h2 className="text-lg font-semibold">Could not load events</h2>
      <p className="text-sm text-muted-foreground">Please refresh and try again.</p>
    </section>
  );
}

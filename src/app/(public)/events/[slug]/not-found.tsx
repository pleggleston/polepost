import Link from 'next/link';

export default function EventNotFound() {
  return (
    <section className="space-y-3 rounded-xl border border-border p-4">
      <h2 className="text-lg font-semibold">Event not found</h2>
      <p className="text-sm text-muted-foreground">This event may be unavailable, expired, or not public.</p>
      <Link href="/browse" className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Back to browse
      </Link>
    </section>
  );
}

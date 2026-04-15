import Link from 'next/link';

export function OrganizerAccessBlocked() {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <h1 className="text-lg font-semibold">Organizer access unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not currently have an active organizer profile.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/organizer-apply"
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Apply as organizer
        </Link>
        <Link
          href="/"
          className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}

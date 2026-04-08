import Link from 'next/link';

export function OrganizerAccessBlocked() {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h1 className="text-lg font-semibold">Organizer access unavailable</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your account does not currently have an active organizer profile. Contact support or an admin to enable organizer access.
      </p>
      <Link href="/" className="mt-4 inline-flex rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
        Back to home
      </Link>
    </section>
  );
}

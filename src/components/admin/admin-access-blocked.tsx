import Link from 'next/link';

type AdminAccessBlockedProps = {
  isAuthenticated: boolean;
};

export function AdminAccessBlocked({ isAuthenticated }: AdminAccessBlockedProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h1 className="text-lg font-semibold">Admin access blocked</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isAuthenticated
          ? 'Your account does not have moderator/admin privileges.'
          : 'You must sign in with a moderator/admin account to access this area.'}
      </p>
      <div className="mt-4 flex gap-2">
        <Link href="/" className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
          Back to home
        </Link>
        {!isAuthenticated ? (
          <Link href="/settings" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            Sign in
          </Link>
        ) : null}
      </div>
    </section>
  );
}

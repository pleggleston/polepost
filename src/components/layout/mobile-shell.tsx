import type { Route } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';
import { logout } from '@/app/(public)/auth-actions';
import { getCurrentUser, getOwnProfile } from '@/lib/auth/session';

type MobileShellProps = {
  children: ReactNode;
};

const baseNavItems: Array<{ href: Route; label: string }> = [
  { href: '/browse', label: 'Browse' },
  { href: '/pole', label: 'Pole' },
  { href: '/saved', label: 'Saved' },
  { href: '/profile', label: 'Profile' }
];

export async function MobileShell({ children }: MobileShellProps) {
  const user = await getCurrentUser();
  const profile = user ? await getOwnProfile() : null;

  const showOrganizerLink =
    profile?.role === 'organizer' ||
    profile?.role === 'admin' ||
    profile?.is_organizer_enabled === true;

  const showAdminLink = profile?.role === 'moderator' || profile?.role === 'admin';

  const extraNavItems: Array<{ href: Route; label: string }> = [];
  if (showOrganizerLink) extraNavItems.push({ href: '/organizer', label: 'Organizer' });
  if (showAdminLink) extraNavItems.push({ href: '/admin', label: 'Admin' });

  const allNavItems = [...baseNavItems, ...extraNavItems];
  const navCols = allNavItems.length <= 4 ? 4 : allNavItems.length;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col border-x border-border bg-white">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          PolePost
        </Link>
        {user ? (
          <form action={logout}>
            <button type="submit" className="rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground">
              Log out
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground">
              Login
            </Link>
            <Link href="/signup" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
              Sign up
            </Link>
          </div>
        )}
      </header>
      <main className="flex-1 px-4 py-4">{children}</main>
      <nav
        className="sticky bottom-0 border-t border-border bg-white p-2"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${navCols}, minmax(0, 1fr))`, gap: '4px' }}
      >
        {allNavItems.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-md px-2 py-2 text-center text-sm font-medium text-muted-foreground hover:bg-muted">
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

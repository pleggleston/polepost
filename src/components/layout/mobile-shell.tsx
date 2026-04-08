import type { Route } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';

type MobileShellProps = {
  children: ReactNode;
};

const navItems: Array<{ href: Route; label: string }> = [
  { href: '/browse', label: 'Browse' },
  { href: '/pole', label: 'Pole' },
  { href: '/saved', label: 'Saved' },
  { href: '/profile', label: 'Profile' }
];

export function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col border-x border-border bg-white">
      <header className="sticky top-0 z-20 border-b border-border bg-white px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          PolePost
        </Link>
      </header>
      <main className="flex-1 px-4 py-4">{children}</main>
      <nav className="sticky bottom-0 grid grid-cols-4 gap-1 border-t border-border bg-white p-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-md px-2 py-2 text-center text-sm font-medium text-muted-foreground hover:bg-muted">
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

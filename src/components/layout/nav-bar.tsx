'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';

type NavItem = { href: Route; label: string };

type NavBarProps = {
  items: NavItem[];
};

export function NavBar({ items }: NavBarProps) {
  const pathname = usePathname();
  const cols = items.length <= 4 ? 4 : items.length;

  function isActive(href: Route): boolean {
    const h = href as string;
    if (h === '/') return pathname === '/';
    return pathname === h || pathname.startsWith(h + '/');
  }

  return (
    <nav
      className="sticky bottom-0 border-t border-border bg-white p-2"
      style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '4px' }}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-md px-2 py-2 text-center text-sm font-medium transition-colors ${
            isActive(item.href)
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

import { MobileShell } from '@/components/layout/mobile-shell';
import { requireRole } from '@/lib/auth/guards';

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['organizer', 'admin']);

  return <MobileShell>{children}</MobileShell>;
}

import { MobileShell } from '@/components/layout/mobile-shell';
import { requireRole } from '@/lib/auth/guards';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['moderator', 'admin']);

  return <MobileShell>{children}</MobileShell>;
}

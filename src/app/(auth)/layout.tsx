import { MobileShell } from '@/components/layout/mobile-shell';
import { requireAuth } from '@/lib/auth/guards';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return <MobileShell>{children}</MobileShell>;
}

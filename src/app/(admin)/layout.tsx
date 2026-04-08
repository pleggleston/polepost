import { MobileShell } from '@/components/layout/mobile-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}

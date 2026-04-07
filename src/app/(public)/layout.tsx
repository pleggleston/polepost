import { MobileShell } from '@/components/layout/mobile-shell';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}

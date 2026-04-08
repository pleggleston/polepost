import { AdminAccessBlocked } from '@/components/admin/admin-access-blocked';
import { getAdminAccessContext } from '@/lib/admin/moderation';

export default async function AdminVerificationPage() {
  const access = await getAdminAccessContext();

  if (!access.isAuthorized) {
    return <AdminAccessBlocked isAuthenticated={access.isAuthenticated} />;
  }

  return <div className="text-sm text-muted-foreground">21+ verification queue placeholder.</div>;
}

import { AdminAccessBlocked } from '@/components/admin/admin-access-blocked';
import { getAdminAccessContext } from '@/lib/admin/moderation';

export default async function AdminCategoriesPage() {
  const access = await getAdminAccessContext();

  if (!access.isAuthorized) {
    return <AdminAccessBlocked isAuthenticated={access.isAuthenticated} />;
  }

  return <div className="text-sm text-muted-foreground">Categories management placeholder.</div>;
}

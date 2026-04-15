import { AdminAccessBlocked } from '@/components/admin/admin-access-blocked';
import { AdminCategoriesTable } from '@/components/admin/admin-categories-table';
import { getAdminAccessContext } from '@/lib/admin/moderation';
import { listAllCategories } from '@/lib/admin/categories';

export default async function AdminCategoriesPage() {
  const access = await getAdminAccessContext();

  if (!access.isAuthorized) {
    return <AdminAccessBlocked isAuthenticated={access.isAuthenticated} />;
  }

  let categories: Awaited<ReturnType<typeof listAllCategories>> = [];
  try {
    categories = await listAllCategories();
  } catch {
    return (
      <section className="space-y-4">
        <header className="rounded-xl border border-border bg-card p-4">
          <h1 className="text-lg font-semibold">Event categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage categories available for event submissions.</p>
        </header>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Could not load categories right now. Please refresh and try again.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold">Event categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage categories available to organizers when creating events. Inactive categories are hidden from the event form.
        </p>
      </header>

      <AdminCategoriesTable categories={categories} />
    </section>
  );
}

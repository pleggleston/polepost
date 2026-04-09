import { logout } from '@/app/(public)/auth-actions';
import { requireAuth } from '@/lib/auth/guards';

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-sm text-muted-foreground">Signed in as {user.email ?? 'unknown email'}.</p>
      </div>

      <form action={logout}>
        <button type="submit" className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted">
          Log out
        </button>
      </form>
    </section>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logout } from '@/app/(public)/auth-actions';
import { getOwnProfile } from '@/lib/auth/session';

export default async function ProfilePage() {
  const profile = await getOwnProfile();

  if (!profile) {
    redirect('/login');
  }

  const displayName = profile.display_name || profile.username || 'Unknown user';
  const isElevatedRole = profile.role === 'organizer' || profile.role === 'moderator' || profile.role === 'admin';

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-lg font-semibold">{displayName}</p>
          {profile.username ? (
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {isElevatedRole ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium capitalize text-primary">
              {profile.role}
            </span>
          ) : null}
          {profile.is_21_verified ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
              21+ Verified
            </span>
          ) : null}
        </div>

        {profile.home_city || profile.home_state ? (
          <p className="text-sm text-muted-foreground">
            {[profile.home_city, profile.home_state].filter(Boolean).join(', ')}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href="/settings"
          className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Edit profile &amp; settings
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-md border border-input px-4 py-2 text-sm font-medium text-destructive hover:bg-muted"
          >
            Log out
          </button>
        </form>
      </div>
    </section>
  );
}

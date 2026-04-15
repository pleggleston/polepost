import { redirect } from 'next/navigation';
import { SettingsForm } from '@/components/auth/settings-form';
import { getOwnProfile } from '@/lib/auth/session';

export default async function SettingsPage() {
  const profile = await getOwnProfile();

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="space-y-4">
      <section className="space-y-1">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </section>

      <SettingsForm profile={profile} />
    </div>
  );
}

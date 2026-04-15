import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/role-checks';
import type { AppRole } from '@/lib/db/enums';

export type PendingVerification = {
  id: string;
  display_name: string | null;
  username: string | null;
  home_city: string | null;
  home_state: string | null;
  requested_21_at: string;
};

async function assertAdminAccess(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated.');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: AppRole }>();

  if (error) {
    throw new Error(`Failed to load role: ${error.message}`);
  }

  const role = profile?.role ?? 'user';
  if (!isAdmin(role)) {
    throw new Error('Admin access required.');
  }

  return user.id;
}

export async function listPendingVerifications(): Promise<PendingVerification[]> {
  await assertAdminAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, home_city, home_state, requested_21_at')
    .not('requested_21_at', 'is', null)
    .eq('is_21_verified', false)
    .order('requested_21_at', { ascending: true })
    .returns<PendingVerification[]>();

  if (error) {
    throw new Error(`Failed to load verification queue: ${error.message}`);
  }

  return data ?? [];
}

export async function approveVerification(
  profileId: string
): Promise<{ error: string | null }> {
  await assertAdminAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      is_21_verified: true,
      verified_21_at: new Date().toISOString(),
      requested_21_at: null
    })
    .eq('id', profileId);

  if (error) {
    return { error: `Failed to approve verification: ${error.message}` };
  }

  return { error: null };
}

export async function denyVerification(
  profileId: string
): Promise<{ error: string | null }> {
  await assertAdminAccess();
  const supabase = await createClient();

  // Clear the request without verifying
  const { error } = await supabase
    .from('profiles')
    .update({ requested_21_at: null })
    .eq('id', profileId);

  if (error) {
    return { error: `Failed to deny verification: ${error.message}` };
  }

  return { error: null };
}

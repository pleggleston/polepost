import { redirect } from 'next/navigation';
import type { AppRole } from '@/lib/db/enums';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from './session';

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  return user;
}

export async function requireRole(allowed: AppRole[]) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_organizer_enabled')
    .eq('id', user.id)
    .maybeSingle();

  const effectiveRole: AppRole = profile?.is_organizer_enabled && profile.role === 'user' ? 'organizer' : (profile?.role ?? 'user');

  if (!allowed.includes(effectiveRole)) {
    redirect('/');
  }

  return { user, profile };
}

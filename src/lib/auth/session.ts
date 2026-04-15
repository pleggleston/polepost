import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { AppRole } from '@/lib/db/enums';

export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  return session?.user ?? null;
});

export type OwnProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  role: AppRole;
  is_organizer_enabled: boolean;
  is_21_verified: boolean;
  verified_21_at: string | null;
  requested_21_at: string | null;
  home_city: string | null;
  home_state: string | null;
};

export const getOwnProfile = cache(async (): Promise<OwnProfile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, role, is_organizer_enabled, is_21_verified, verified_21_at, requested_21_at, home_city, home_state')
    .eq('id', user.id)
    .maybeSingle<OwnProfile>();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return data;
});

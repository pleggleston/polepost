'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';

type ActionState = { error: string | null; success?: boolean };

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export async function updateProfileSettings(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'You must be signed in to update your profile.' };
  }

  const displayNameRaw = formData.get('display_name');
  const usernameRaw = formData.get('username');
  const homeCityRaw = formData.get('home_city');
  const homeStateRaw = formData.get('home_state');

  const displayName = typeof displayNameRaw === 'string' ? displayNameRaw.trim() : '';
  const username = typeof usernameRaw === 'string' ? usernameRaw.trim() : '';
  const homeCity = typeof homeCityRaw === 'string' ? homeCityRaw.trim() || null : null;
  const homeState = typeof homeStateRaw === 'string' ? homeStateRaw.trim() || null : null;

  if (!displayName || displayName.length < 2 || displayName.length > 80) {
    return { error: 'Display name must be between 2 and 80 characters.' };
  }

  if (!username || username.length < 3 || username.length > 30) {
    return { error: 'Username must be between 3 and 30 characters.' };
  }

  if (!USERNAME_REGEX.test(username)) {
    return { error: 'Username may only contain letters, numbers, and underscores.' };
  }

  const supabase = await createClient();

  // Check username uniqueness (excluding current user)
  const { data: existing, error: lookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (lookupError) {
    return { error: `Could not validate username: ${lookupError.message}` };
  }

  if (existing) {
    return { error: 'That username is already taken. Please choose another.' };
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ display_name: displayName, username, home_city: homeCity, home_state: homeState })
    .eq('id', user.id);

  if (updateError) {
    return { error: `Failed to save profile: ${updateError.message}` };
  }

  revalidatePath('/profile');
  revalidatePath('/settings');
  return { error: null, success: true };
}

export async function requestVerification(
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'You must be signed in to request verification.' };
  }

  const supabase = await createClient();

  // Only set if not already verified or pending
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_21_verified, requested_21_at')
    .eq('id', user.id)
    .maybeSingle<{ is_21_verified: boolean; requested_21_at: string | null }>();

  if (profileError) {
    return { error: `Could not load profile: ${profileError.message}` };
  }

  if (profile?.is_21_verified) {
    return { error: null, success: true }; // already verified, no-op
  }

  if (profile?.requested_21_at) {
    return { error: null, success: true }; // already requested, no-op
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ requested_21_at: new Date().toISOString() })
    .eq('id', user.id);

  if (updateError) {
    return { error: `Failed to submit request: ${updateError.message}` };
  }

  revalidatePath('/settings');
  revalidatePath('/profile');
  return { error: null, success: true };
}

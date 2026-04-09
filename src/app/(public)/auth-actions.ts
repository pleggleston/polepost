'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type AuthActionState = {
  error: string | null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toUsernameSeed(email: string) {
  const localPart = email.split('@')[0] ?? 'user';
  const sanitized = localPart.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');

  if (sanitized.length >= 3) {
    return sanitized.slice(0, 24);
  }

  return `user_${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
}

function toFallbackUsername(seed: string, userId: string) {
  const suffix = userId.replace(/-/g, '').slice(0, 6);
  const base = seed.slice(0, 17);
  return `${base}_${suffix}`;
}

export async function signupWithPassword(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const emailRaw = formData.get('email');
  const passwordRaw = formData.get('password');
  const displayNameRaw = formData.get('display_name');

  const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';
  const password = typeof passwordRaw === 'string' ? passwordRaw : '';
  const displayName = typeof displayNameRaw === 'string' ? displayNameRaw.trim() : '';

  if (!EMAIL_REGEX.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    return { error: error.message };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { error: 'Signup succeeded, but user id was missing.' };
  }

  const usernameSeed = toUsernameSeed(email);
  const profileDisplayName = displayName || usernameSeed;
  const baseProfilePayload = {
    id: userId,
    display_name: profileDisplayName,
    role: 'user' as const,
    is_organizer_enabled: false,
    is_21_verified: false,
    verified_21_at: null,
    home_city: null,
    home_state: null
  };

  const { error: upsertError } = await supabase.from('profiles').upsert(
    {
      ...baseProfilePayload,
      username: usernameSeed
    },
    {
      onConflict: 'id'
    }
  );

  if (upsertError?.code === '23505') {
    const fallbackUsername = toFallbackUsername(usernameSeed, userId);
    const { error: retryError } = await supabase.from('profiles').upsert(
      {
        ...baseProfilePayload,
        username: fallbackUsername
      },
      {
        onConflict: 'id'
      }
    );

    if (retryError) {
      return { error: `Signup succeeded, but profile bootstrap failed: ${retryError.message}` };
    }
  } else if (upsertError) {
    return { error: `Signup succeeded, but profile bootstrap failed: ${upsertError.message}` };
  }

  redirect('/');
}

export async function loginWithPassword(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const emailRaw = formData.get('email');
  const passwordRaw = formData.get('password');

  const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';
  const password = typeof passwordRaw === 'string' ? passwordRaw : '';

  if (!EMAIL_REGEX.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  if (password.length === 0) {
    return { error: 'Password is required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/');
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/auth/site-url';

type ActionState = { error: string | null; sent?: boolean };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestPasswordReset(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const emailRaw = formData.get('email');
  const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';

  if (!EMAIL_REGEX.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  const supabase = await createClient();
  const redirectTo = new URL('/auth/reset-password', getSiteUrl()).toString();

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    return { error: error.message };
  }

  // Always show success to avoid leaking which emails are registered
  return { error: null, sent: true };
}

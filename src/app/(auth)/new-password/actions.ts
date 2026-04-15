'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type ActionState = { error: string | null };

export async function updatePassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const passwordRaw = formData.get('password');
  const confirmRaw = formData.get('confirm_password');

  const password = typeof passwordRaw === 'string' ? passwordRaw : '';
  const confirm = typeof confirmRaw === 'string' ? confirmRaw : '';

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  if (password !== confirm) {
    return { error: 'Passwords do not match.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect('/profile');
}

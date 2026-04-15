'use server';

import { revalidatePath } from 'next/cache';
import { approveVerification, denyVerification } from '@/lib/admin/verification';

type ActionState = { error: string | null };

export async function approveVerificationAction(profileId: string): Promise<ActionState> {
  const result = await approveVerification(profileId);

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath('/admin/verification');
  return { error: null };
}

export async function denyVerificationAction(profileId: string): Promise<ActionState> {
  const result = await denyVerification(profileId);

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath('/admin/verification');
  return { error: null };
}

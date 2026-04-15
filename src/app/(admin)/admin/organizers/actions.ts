'use server';

import { revalidatePath } from 'next/cache';
import {
  approveOrganizerApplication,
  denyOrganizerApplication
} from '@/lib/admin/organizers';

type ActionState = { error: string | null };

export async function approveOrganizerAction(
  organizerId: string,
  ownerProfileId: string
): Promise<ActionState> {
  const result = await approveOrganizerApplication(organizerId, ownerProfileId);
  if (result.error) return { error: result.error };
  revalidatePath('/admin/organizers');
  revalidatePath('/admin');
  return { error: null };
}

export async function denyOrganizerAction(
  organizerId: string
): Promise<ActionState> {
  const result = await denyOrganizerApplication(organizerId);
  if (result.error) return { error: result.error };
  revalidatePath('/admin/organizers');
  revalidatePath('/admin');
  return { error: null };
}

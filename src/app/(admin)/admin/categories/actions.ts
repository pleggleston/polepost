'use server';

import { revalidatePath } from 'next/cache';
import { createCategory, toggleCategoryActive } from '@/lib/admin/categories';

type ActionState = { error: string | null };

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const labelRaw = formData.get('label');
  const label = typeof labelRaw === 'string' ? labelRaw : '';

  const result = await createCategory(label);

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath('/admin/categories');
  return { error: null };
}

export async function toggleCategoryAction(
  id: string,
  isActive: boolean
): Promise<ActionState> {
  const result = await toggleCategoryActive(id, isActive);

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath('/admin/categories');
  return { error: null };
}

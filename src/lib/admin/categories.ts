import { createClient } from '@/lib/supabase/server';
import { isModeratorOrAdmin } from '@/lib/auth/role-checks';
import type { AppRole } from '@/lib/db/enums';

export type AdminCategory = {
  id: string;
  slug: string;
  label: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

async function assertStaffAccess(): Promise<string> {
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
  if (!isModeratorOrAdmin(role)) {
    throw new Error('Not authorized.');
  }

  return user.id;
}

function slugifyLabel(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function listAllCategories(): Promise<AdminCategory[]> {
  await assertStaffAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('event_categories')
    .select('id, slug, label, is_active, sort_order, created_at')
    .order('sort_order', { ascending: true })
    .order('label', { ascending: true })
    .returns<AdminCategory[]>();

  if (error) {
    throw new Error(`Failed to list categories: ${error.message}`);
  }

  return data ?? [];
}

export async function createCategory(label: string): Promise<{ error: string | null }> {
  await assertStaffAccess();

  const trimmedLabel = label.trim();
  if (!trimmedLabel || trimmedLabel.length < 2 || trimmedLabel.length > 60) {
    return { error: 'Category label must be between 2 and 60 characters.' };
  }

  const slug = slugifyLabel(trimmedLabel);
  if (!slug) {
    return { error: 'Could not generate a valid slug from that label.' };
  }

  const supabase = await createClient();

  // Get current max sort_order
  const { data: maxRow } = await supabase
    .from('event_categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();

  const nextSortOrder = (maxRow?.sort_order ?? 0) + 10;

  const { error } = await supabase
    .from('event_categories')
    .insert({ slug, label: trimmedLabel, is_active: true, sort_order: nextSortOrder });

  if (error) {
    if (error.code === '23505') {
      return { error: 'A category with that label or slug already exists.' };
    }
    return { error: `Failed to create category: ${error.message}` };
  }

  return { error: null };
}

export async function toggleCategoryActive(
  id: string,
  isActive: boolean
): Promise<{ error: string | null }> {
  await assertStaffAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from('event_categories')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    return { error: `Failed to update category: ${error.message}` };
  }

  return { error: null };
}

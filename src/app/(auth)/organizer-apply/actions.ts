'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';

type ActionState = { error: string | null };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function applyAsOrganizer(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'You must be signed in to apply.' };

  const nameRaw = formData.get('name');
  const bioRaw = formData.get('bio');
  const contactEmailRaw = formData.get('contact_email');
  const instagramRaw = formData.get('instagram_url');

  const name = typeof nameRaw === 'string' ? nameRaw.trim() : '';
  const bio = typeof bioRaw === 'string' ? bioRaw.trim() || null : null;
  const contactEmail = typeof contactEmailRaw === 'string' ? contactEmailRaw.trim() || null : null;
  const instagramUrl = typeof instagramRaw === 'string' ? instagramRaw.trim() || null : null;

  if (!name || name.length < 2 || name.length > 100) {
    return { error: 'Organizer name must be between 2 and 100 characters.' };
  }

  const supabase = await createClient();

  // Check if they already have an organizer record
  const { data: existing } = await supabase
    .from('organizers')
    .select('id, is_active')
    .eq('owner_profile_id', user.id)
    .maybeSingle<{ id: string; is_active: boolean }>();

  if (existing) {
    if (existing.is_active) {
      redirect('/organizer');
    }
    return { error: 'You already have a pending organizer application.' };
  }

  // Generate a unique slug from the name
  const baseSlug = slugify(name);
  if (!baseSlug) return { error: 'Could not generate a slug from that name.' };

  const { data: slugMatches } = await supabase
    .from('organizers')
    .select('slug')
    .ilike('slug', `${baseSlug}%`)
    .returns<{ slug: string }[]>();

  const reserved = new Set((slugMatches ?? []).map((r) => r.slug));
  let slug = baseSlug;
  let suffix = 2;
  while (reserved.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const { error: insertError } = await supabase.from('organizers').insert({
    owner_profile_id: user.id,
    name,
    slug,
    bio,
    contact_email: contactEmail,
    instagram_url: instagramUrl,
    is_active: false
  });

  if (insertError) {
    if (insertError.code === '23505') {
      return { error: 'An organizer with that name already exists. Try a different name.' };
    }
    return { error: `Failed to submit application: ${insertError.message}` };
  }

  redirect('/organizer-apply?submitted=1');
}

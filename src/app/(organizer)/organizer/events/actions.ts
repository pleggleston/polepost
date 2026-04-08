'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  EVENT_FLYER_BUCKET,
  parseEventInput,
  slugifyTitle,
  validateFlyerFile
} from '@/lib/organizer/event-form';
import { getOrganizerContext } from '@/lib/organizer/queries';

type ActionResult = {
  error: string | null;
};

async function generateUniqueSlug(baseTitle: string, eventIdToExclude?: string): Promise<string> {
  const supabase = await createClient();
  const baseSlug = slugifyTitle(baseTitle);

  const { data, error } = await supabase
    .from('events')
    .select('id, slug')
    .ilike('slug', `${baseSlug}%`)
    .returns<{ id: string; slug: string }[]>();

  if (error) {
    throw new Error(`Failed to generate slug: ${error.message}`);
  }

  const reserved = new Set(
    (data ?? [])
      .filter((row) => row.id !== eventIdToExclude)
      .map((row) => row.slug)
  );

  if (!reserved.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (reserved.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

async function uploadFlyerFile(file: File, userId: string) {
  const fileValidationError = validateFlyerFile(file);
  if (fileValidationError) {
    throw new Error(fileValidationError);
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const objectPath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const supabase = await createClient();

  const { error: uploadError } = await supabase.storage
    .from(EVENT_FLYER_BUCKET)
    .upload(objectPath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new Error(`Flyer upload failed: ${uploadError.message}`);
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(EVENT_FLYER_BUCKET).getPublicUrl(objectPath);

  return {
    flyer_path: objectPath,
    flyer_url: publicUrl || null
  };
}

export async function createOrganizerEvent(_previousState: ActionResult, formData: FormData): Promise<ActionResult> {
  const organizerContext = await getOrganizerContext();
  if (!organizerContext.hasOrganizerAccess || !organizerContext.organizerId) {
    return { error: 'Organizer access is required to create events.' };
  }

  const parsed = parseEventInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid event input.' };
  }

  const flyerFile = formData.get('flyer_file');

  if (!(flyerFile instanceof File) || flyerFile.size === 0) {
    return { error: 'A flyer image is required.' };
  }

  try {
    const flyer = await uploadFlyerFile(flyerFile, organizerContext.userId);
    const slug = await generateUniqueSlug(parsed.data.title);
    const supabase = await createClient();

    const payload = {
      organizer_id: organizerContext.organizerId,
      created_by_profile_id: organizerContext.userId,
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      flyer_path: flyer.flyer_path,
      flyer_url: flyer.flyer_url,
      venue_name: parsed.data.venue_name,
      address_line1: parsed.data.address_line1 ?? null,
      city: parsed.data.city,
      state: parsed.data.state,
      postal_code: parsed.data.postal_code ?? null,
      starts_at: parsed.data.starts_at,
      ends_at: parsed.data.ends_at ?? null,
      timezone: parsed.data.timezone,
      category_id: parsed.data.category_id,
      visibility: parsed.data.visibility,
      age_requirement: parsed.data.age_requirement,
      external_url: parsed.data.external_url ?? null,
      moderation_status: 'pending_review' as const,
      lifecycle_status: 'pending' as const
    };

    const { error } = await supabase.from('events').insert(payload);

    if (error) {
      return { error: `Failed to save event: ${error.message}` };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Event creation failed unexpectedly.'
    };
  }

  revalidatePath('/organizer');
  revalidatePath('/organizer/events');
  redirect('/organizer/events');
}

export async function updateOrganizerEvent(
  eventId: string,
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const organizerContext = await getOrganizerContext();
  if (!organizerContext.hasOrganizerAccess || !organizerContext.organizerId) {
    return { error: 'Organizer access is required to edit events.' };
  }

  const parsed = parseEventInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid event input.' };
  }

  const supabase = await createClient();
  const { data: existingEvent, error: existingError } = await supabase
    .from('events')
    .select('id, flyer_path, flyer_url, organizer_id')
    .eq('id', eventId)
    .eq('organizer_id', organizerContext.organizerId)
    .maybeSingle<{ id: string; flyer_path: string; flyer_url: string | null; organizer_id: string }>();

  if (existingError) {
    return { error: `Failed to load event: ${existingError.message}` };
  }

  if (!existingEvent) {
    return { error: 'Event not found or not editable for this organizer.' };
  }

  const flyerFile = formData.get('flyer_file');
  let flyer_path = existingEvent.flyer_path;
  let flyer_url = existingEvent.flyer_url;

  if (flyerFile instanceof File && flyerFile.size > 0) {
    try {
      const uploadedFlyer = await uploadFlyerFile(flyerFile, organizerContext.userId);
      flyer_path = uploadedFlyer.flyer_path;
      flyer_url = uploadedFlyer.flyer_url;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Flyer upload failed unexpectedly.'
      };
    }
  }

  const slug = await generateUniqueSlug(parsed.data.title, eventId);

  const payload = {
    title: parsed.data.title,
    slug,
    description: parsed.data.description,
    flyer_path,
    flyer_url,
    venue_name: parsed.data.venue_name,
    address_line1: parsed.data.address_line1 ?? null,
    city: parsed.data.city,
    state: parsed.data.state,
    postal_code: parsed.data.postal_code ?? null,
    starts_at: parsed.data.starts_at,
    ends_at: parsed.data.ends_at ?? null,
    timezone: parsed.data.timezone,
    category_id: parsed.data.category_id,
    visibility: parsed.data.visibility,
    age_requirement: parsed.data.age_requirement,
    external_url: parsed.data.external_url ?? null,
    moderation_status: 'pending_review' as const,
    lifecycle_status: 'pending' as const,
    approved_at: null,
    approved_by_profile_id: null,
    rejected_at: null,
    moderation_reason: null
  };

  const { error: updateError } = await supabase
    .from('events')
    .update(payload)
    .eq('id', eventId)
    .eq('organizer_id', organizerContext.organizerId);

  if (updateError) {
    return { error: `Failed to update event: ${updateError.message}` };
  }

  revalidatePath('/organizer');
  revalidatePath('/organizer/events');
  revalidatePath(`/events/${slug}`);
  redirect('/organizer/events');
}

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { AgeRequirement, EventVisibility } from '@/lib/db/enums';

const SAVED_EVENT_SELECT = `
  event_id,
  created_at,
  event:events (
    id,
    slug,
    title,
    description,
    flyer_url,
    venue_name,
    address_line1,
    city,
    state,
    starts_at,
    ends_at,
    timezone,
    external_url,
    visibility,
    age_requirement,
    category:event_categories (slug, label)
  )
`;

type SavedEventItemRow = {
  event_id: string;
  created_at: string;
  event: {
    id: string;
    slug: string;
    title: string;
    description: string;
    flyer_url: string | null;
    venue_name: string;
    address_line1: string | null;
    city: string;
    state: string;
    starts_at: string;
    ends_at: string | null;
    timezone: string;
    external_url: string | null;
    visibility: EventVisibility;
    age_requirement: AgeRequirement;
    category: {
      slug: string;
      label: string;
    } | null;
  } | null;
};

export type SavedEventItem = SavedEventItemRow;

export async function listSavedEventsForProfile(profileId: string): Promise<SavedEventItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('saved_events')
    .select(SAVED_EVENT_SELECT)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .returns<SavedEventItemRow[]>();

  if (error) {
    throw new Error(`Failed to list saved events: ${error.message}`);
  }

  return data ?? [];
}

export const isEventSavedForProfile = cache(async (profileId: string, eventId: string): Promise<boolean> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('saved_events')
    .select('event_id')
    .eq('profile_id', profileId)
    .eq('event_id', eventId)
    .limit(1)
    .maybeSingle<{ event_id: string }>();

  if (error) {
    throw new Error(`Failed to check saved event state: ${error.message}`);
  }

  return Boolean(data);
});

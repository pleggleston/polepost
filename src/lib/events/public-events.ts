import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { EventLifecycleStatus, EventVisibility, ModerationStatus } from '@/lib/db/enums';

const PUBLIC_VISIBILITY: EventVisibility = 'public';
const APPROVED_MODERATION_STATUS: ModerationStatus = 'approved';
const APPROVED_LIFECYCLE_STATUS: EventLifecycleStatus = 'approved';

const PUBLIC_EVENT_SELECT = `
  id,
  slug,
  title,
  description,
  flyer_url,
  flyer_path,
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
`;

export const DATE_PRESETS = ['today', 'this_week', 'this_weekend'] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

export type PublicEventFilters = {
  city?: string;
  category?: string;
  datePreset?: DatePreset;
  limit?: number;
};

type PublicEventRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  flyer_url: string | null;
  flyer_path: string;
  venue_name: string;
  address_line1: string | null;
  city: string;
  state: string;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  external_url: string | null;
  visibility: EventVisibility;
  age_requirement: 'all_ages' | 'age_18_plus' | 'age_21_plus';
  category: {
    slug: string;
    label: string;
  } | null;
};

export type PublicEvent = PublicEventRow;

export type PublicCategory = {
  slug: string;
  label: string;
};

function toDateRange(datePreset?: DatePreset): { start?: string; end?: string } {
  if (!datePreset) {
    return {};
  }

  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (datePreset === 'today') {
    const endOfToday = new Date(startOfToday);
    endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);
    return { start: startOfToday.toISOString(), end: endOfToday.toISOString() };
  }

  if (datePreset === 'this_week') {
    const dayOfWeek = startOfToday.getUTCDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    const endExclusive = new Date(startOfToday);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + daysUntilSunday + 1);
    return { start: startOfToday.toISOString(), end: endExclusive.toISOString() };
  }

  const dayOfWeek = startOfToday.getUTCDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  const saturdayStart = new Date(startOfToday);
  saturdayStart.setUTCDate(saturdayStart.getUTCDate() + daysUntilSaturday);
  const mondayStart = new Date(saturdayStart);
  mondayStart.setUTCDate(mondayStart.getUTCDate() + 2);

  return { start: saturdayStart.toISOString(), end: mondayStart.toISOString() };
}

async function resolveCategoryIdBySlug(slug: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('event_categories')
    .select('id')
    .eq('is_active', true)
    .eq('slug', slug)
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(`Failed to resolve category: ${error.message}`);
  }

  return data?.id ?? null;
}

export async function listPublicEvents(filters: PublicEventFilters = {}): Promise<PublicEvent[]> {
  const supabase = await createClient();

  const trimmedCity = filters.city?.trim();
  const trimmedCategory = filters.category?.trim();
  const dateRange = toDateRange(filters.datePreset);

  const categoryId = trimmedCategory ? await resolveCategoryIdBySlug(trimmedCategory) : null;
  if (trimmedCategory && !categoryId) {
    return [];
  }

  let query = supabase
    .from('events')
    .select(PUBLIC_EVENT_SELECT)
    .eq('visibility', PUBLIC_VISIBILITY)
    .eq('moderation_status', APPROVED_MODERATION_STATUS)
    .eq('lifecycle_status', APPROVED_LIFECYCLE_STATUS)
    .gte('expires_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .order('created_at', { ascending: true });

  if (trimmedCity) {
    query = query.ilike('city', `%${trimmedCity}%`);
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (dateRange.start) {
    query = query.gte('starts_at', dateRange.start);
  }

  if (dateRange.end) {
    query = query.lt('starts_at', dateRange.end);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query.returns<PublicEventRow[]>();

  if (error) {
    throw new Error(`Failed to list public events: ${error.message}`);
  }

  return data ?? [];
}

export const getPublicEventBySlug = cache(async (slug: string): Promise<PublicEvent | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select(PUBLIC_EVENT_SELECT)
    .eq('slug', slug)
    .eq('visibility', PUBLIC_VISIBILITY)
    .eq('moderation_status', APPROVED_MODERATION_STATUS)
    .eq('lifecycle_status', APPROVED_LIFECYCLE_STATUS)
    .gte('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle()
    .returns<PublicEventRow | null>();

  if (error) {
    throw new Error(`Failed to fetch public event by slug: ${error.message}`);
  }

  return data;
});

export function getFeaturedPublicEvents(limit = 3): Promise<PublicEvent[]> {
  return listPublicEvents({ limit });
}

export const listPublicCategories = cache(async (): Promise<PublicCategory[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('event_categories')
    .select('slug, label')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .returns<PublicCategory[]>();

  if (error) {
    throw new Error(`Failed to list event categories: ${error.message}`);
  }

  return data ?? [];
});

import { createClient } from '@/lib/supabase/server';
import type { AgeRequirement, EventLifecycleStatus, EventVisibility, ModerationStatus } from '@/lib/db/enums';

export type OrganizerContext = {
  userId: string;
  organizerId: string | null;
  organizerName: string | null;
  hasOrganizerAccess: boolean;
};

export type OrganizerCategory = {
  id: string;
  label: string;
};

export type OrganizerEventListItem = {
  id: string;
  title: string;
  starts_at: string;
  moderation_status: ModerationStatus;
  lifecycle_status: EventLifecycleStatus;
  moderation_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizerEventFormData = {
  id: string;
  title: string;
  description: string;
  flyer_path: string;
  flyer_url: string | null;
  venue_name: string;
  address_line1: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  category_id: string;
  visibility: EventVisibility;
  age_requirement: AgeRequirement;
  external_url: string | null;
  moderation_status: ModerationStatus;
  lifecycle_status: EventLifecycleStatus;
};

export async function getOrganizerContext(): Promise<OrganizerContext> {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: '', organizerId: null, organizerName: null, hasOrganizerAccess: false };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_organizer_enabled')
    .eq('id', user.id)
    .maybeSingle<{ role: 'user' | 'organizer' | 'moderator' | 'admin'; is_organizer_enabled: boolean }>();

  const hasRoleAccess =
    profile?.role === 'organizer' || profile?.role === 'admin' || profile?.is_organizer_enabled === true;

  if (!hasRoleAccess) {
    return { userId: user.id, organizerId: null, organizerName: null, hasOrganizerAccess: false };
  }

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id, name')
    .eq('owner_profile_id', user.id)
    .eq('is_active', true)
    .maybeSingle<{ id: string; name: string }>();

  if (!organizer) {
    return { userId: user.id, organizerId: null, organizerName: null, hasOrganizerAccess: false };
  }

  return {
    userId: user.id,
    organizerId: organizer.id,
    organizerName: organizer.name,
    hasOrganizerAccess: true
  };
}

export async function listOrganizerCategories(): Promise<OrganizerCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('event_categories')
    .select('id, label')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .returns<OrganizerCategory[]>();

  if (error) {
    throw new Error(`Failed to fetch event categories: ${error.message}`);
  }

  return data ?? [];
}

export async function listOwnedEvents(organizerId: string): Promise<OrganizerEventListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('id, title, starts_at, moderation_status, lifecycle_status, moderation_reason, created_at, updated_at')
    .eq('organizer_id', organizerId)
    .order('updated_at', { ascending: false })
    .returns<OrganizerEventListItem[]>();

  if (error) {
    throw new Error(`Failed to fetch organizer events: ${error.message}`);
  }

  return data ?? [];
}

export async function getOwnedEventForEdit(eventId: string, organizerId: string): Promise<OrganizerEventFormData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select(
      'id, title, description, flyer_path, flyer_url, venue_name, address_line1, city, state, postal_code, starts_at, ends_at, timezone, category_id, visibility, age_requirement, external_url, moderation_status, lifecycle_status'
    )
    .eq('id', eventId)
    .eq('organizer_id', organizerId)
    .maybeSingle<OrganizerEventFormData>();

  if (error) {
    throw new Error(`Failed to fetch event for edit: ${error.message}`);
  }

  return data;
}

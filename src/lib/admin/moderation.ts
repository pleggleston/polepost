import { createClient } from '@/lib/supabase/server';
import { isModeratorOrAdmin } from '@/lib/auth/role-checks';
import type { AppRole, EventLifecycleStatus, ModerationStatus } from '@/lib/db/enums';

export type AdminAccessContext = {
  isAuthenticated: boolean;
  isAuthorized: boolean;
  userId: string | null;
  role: AppRole | null;
};

export type AdminEventRecord = {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  visibility: 'public' | 'registered' | 'verified_21_plus' | 'admin_only';
  lifecycle_status: EventLifecycleStatus;
  moderation_status: ModerationStatus;
  moderation_reason: string | null;
  flyer_url: string | null;
  flyer_path: string;
  organizer_id: string;
  created_by_profile_id: string;
  city: string;
  state: string;
  venue_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  organizer: {
    name: string;
    owner_profile_id: string;
  } | null;
};

export type ModerationAction = 'approve' | 'reject' | 'flag';

export type ModerateEventInput = {
  eventId: string;
  action: ModerationAction;
  notes: string | null;
  reasonForOrganizer: string | null;
};

export type ModerateEventResult = {
  ok: boolean;
  error: string | null;
};

const ADMIN_EVENT_SELECT = `
  id,
  title,
  slug,
  starts_at,
  visibility,
  lifecycle_status,
  moderation_status,
  moderation_reason,
  flyer_url,
  flyer_path,
  organizer_id,
  created_by_profile_id,
  city,
  state,
  venue_name,
  description,
  created_at,
  updated_at,
  approved_at,
  rejected_at,
  organizer:organizers (name, owner_profile_id)
`;

export async function getAdminAccessContext(): Promise<AdminAccessContext> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAuthenticated: false, isAuthorized: false, userId: null, role: null };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: AppRole }>();

  if (error) {
    throw new Error(`Failed to load profile role: ${error.message}`);
  }

  const role = profile?.role ?? 'user';
  return {
    isAuthenticated: true,
    isAuthorized: isModeratorOrAdmin(role),
    userId: user.id,
    role
  };
}

export async function listModerationQueueEvents(): Promise<AdminEventRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select(ADMIN_EVENT_SELECT)
    .eq('moderation_status', 'pending_review')
    .eq('lifecycle_status', 'pending')
    .order('updated_at', { ascending: true })
    .returns<AdminEventRecord[]>();

  if (error) {
    throw new Error(`Failed to load moderation queue: ${error.message}`);
  }

  return data ?? [];
}

export async function listAdminEvents(): Promise<AdminEventRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select(ADMIN_EVENT_SELECT)
    .order('updated_at', { ascending: false })
    .limit(200)
    .returns<AdminEventRecord[]>();

  if (error) {
    throw new Error(`Failed to load admin events: ${error.message}`);
  }

  return data ?? [];
}

function nextStatuses(action: ModerationAction): { moderation_status: ModerationStatus; lifecycle_status: EventLifecycleStatus } {
  if (action === 'approve') {
    return { moderation_status: 'approved', lifecycle_status: 'approved' };
  }

  if (action === 'reject') {
    return { moderation_status: 'rejected', lifecycle_status: 'rejected' };
  }

  return { moderation_status: 'flagged', lifecycle_status: 'flagged' };
}

export async function moderateEvent(input: ModerateEventInput): Promise<ModerateEventResult> {
  const access = await getAdminAccessContext();

  if (!access.isAuthenticated || !access.userId) {
    return { ok: false, error: 'You must be signed in to moderate events.' };
  }

  if (!access.isAuthorized) {
    return { ok: false, error: 'You are not authorized to moderate events.' };
  }

  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from('events')
    .select('id, moderation_status, lifecycle_status')
    .eq('id', input.eventId)
    .maybeSingle<{ id: string; moderation_status: ModerationStatus; lifecycle_status: EventLifecycleStatus }>();

  if (currentError) {
    return { ok: false, error: `Failed to load event state: ${currentError.message}` };
  }

  if (!current) {
    return { ok: false, error: 'Event not found.' };
  }

  if (current.moderation_status !== 'pending_review' || current.lifecycle_status !== 'pending') {
    return {
      ok: false,
      error: `Event is not in a reviewable state (current: ${current.moderation_status}/${current.lifecycle_status}).`
    };
  }

  const statuses = nextStatuses(input.action);
  const reasonForOrganizer = input.reasonForOrganizer?.trim() || null;
  const notes = input.notes?.trim() || null;

  const payload =
    input.action === 'approve'
      ? {
          moderation_status: statuses.moderation_status,
          lifecycle_status: statuses.lifecycle_status,
          moderation_reason: null,
          approved_at: new Date().toISOString(),
          approved_by_profile_id: access.userId,
          rejected_at: null
        }
      : {
          moderation_status: statuses.moderation_status,
          lifecycle_status: statuses.lifecycle_status,
          moderation_reason: reasonForOrganizer,
          approved_at: null,
          approved_by_profile_id: null,
          rejected_at: input.action === 'reject' ? new Date().toISOString() : null
        };

  const { data: updatedRows, error: updateError } = await supabase
    .from('events')
    .update(payload)
    .eq('id', input.eventId)
    .eq('moderation_status', 'pending_review')
    .eq('lifecycle_status', 'pending')
    .select('id')
    .returns<Array<{ id: string }>>();

  if (updateError) {
    return { ok: false, error: `Failed to update moderation status: ${updateError.message}` };
  }

  if (!updatedRows || updatedRows.length === 0) {
    return { ok: false, error: 'Event was already moderated by another reviewer. Refresh and try again.' };
  }

  const { error: reviewError } = await supabase.from('moderation_reviews').insert({
    event_id: input.eventId,
    reviewer_profile_id: access.userId,
    decision: input.action,
    notes,
    reason_for_organizer: reasonForOrganizer
  });

  if (reviewError) {
    return { ok: false, error: `Event updated, but failed to log moderation review: ${reviewError.message}` };
  }

  return { ok: true, error: null };
}

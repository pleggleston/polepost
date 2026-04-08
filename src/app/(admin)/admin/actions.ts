'use server';

import { revalidatePath } from 'next/cache';
import { moderateEvent, type ModerationAction } from '@/lib/admin/moderation';

type ModerationActionState = {
  error: string | null;
  success: string | null;
};

const ACTION_MESSAGES: Record<ModerationAction, string> = {
  approve: 'Event approved.',
  reject: 'Event rejected.',
  flag: 'Event flagged.'
};

export async function submitModerationAction(
  _previousState: ModerationActionState,
  formData: FormData
): Promise<ModerationActionState> {
  const eventId = formData.get('event_id');
  const action = formData.get('action');
  const notes = formData.get('notes');
  const reasonForOrganizer = formData.get('reason_for_organizer');

  if (typeof eventId !== 'string' || !eventId) {
    return { error: 'Missing event id.', success: null };
  }

  if (action !== 'approve' && action !== 'reject' && action !== 'flag') {
    return { error: 'Invalid moderation action.', success: null };
  }

  const result = await moderateEvent({
    eventId,
    action,
    notes: typeof notes === 'string' ? notes : null,
    reasonForOrganizer: typeof reasonForOrganizer === 'string' ? reasonForOrganizer : null
  });

  if (!result.ok) {
    return { error: result.error, success: null };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/moderation');
  revalidatePath('/admin/events');
  revalidatePath('/browse');
  revalidatePath('/pole');

  return { error: null, success: ACTION_MESSAGES[action] };
}

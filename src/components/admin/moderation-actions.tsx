'use client';

import { useActionState } from 'react';
import { submitModerationAction } from '@/app/(admin)/admin/actions';

type ModerationActionsProps = {
  eventId: string;
  disabled?: boolean;
};

type ModerationActionState = {
  error: string | null;
  success: string | null;
};

const initialState: ModerationActionState = { error: null, success: null };

export function ModerationActions({ eventId, disabled = false }: ModerationActionsProps) {
  const [state, formAction, isPending] = useActionState(submitModerationAction, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border bg-card p-3">
      <input type="hidden" name="event_id" value={eventId} />

      <div className="grid gap-2">
        <label htmlFor={`reason-${eventId}`} className="text-xs font-medium text-muted-foreground">
          Reason for organizer (stored in moderation_reason)
        </label>
        <textarea
          id={`reason-${eventId}`}
          name="reason_for_organizer"
          rows={2}
          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          placeholder="Optional reason shown to organizer"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor={`notes-${eventId}`} className="text-xs font-medium text-muted-foreground">
          Internal moderation notes
        </label>
        <textarea
          id={`notes-${eventId}`}
          name="notes"
          rows={2}
          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          placeholder="Optional internal notes"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <DecisionButton label="Approve" action="approve" disabled={disabled || isPending} variant="primary" />
        <DecisionButton label="Reject" action="reject" disabled={disabled || isPending} variant="danger" />
        <DecisionButton label="Flag" action="flag" disabled={disabled || isPending} variant="warning" />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}
    </form>
  );
}

function DecisionButton({
  label,
  action,
  disabled,
  variant
}: {
  label: string;
  action: 'approve' | 'reject' | 'flag';
  disabled: boolean;
  variant: 'primary' | 'danger' | 'warning';
}) {
  const variantClass =
    variant === 'primary'
      ? 'bg-primary text-primary-foreground'
      : variant === 'danger'
        ? 'bg-destructive text-destructive-foreground'
        : 'bg-amber-500 text-black';

  return (
    <button
      type="submit"
      name="action"
      value={action}
      disabled={disabled}
      className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${variantClass}`}
    >
      {label}
    </button>
  );
}

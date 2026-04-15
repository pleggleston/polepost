'use client';

import { useActionState } from 'react';
import { updatePassword } from '@/app/(auth)/new-password/actions';

type ActionState = { error: string | null };
const defaultState: ActionState = { error: null };

export function NewPasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, defaultState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Set new password</h1>
        <p className="text-sm text-muted-foreground">Choose a strong password for your account.</p>
      </div>

      {state.error ? (
        <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{state.error}</p>
      ) : null}

      <fieldset disabled={isPending} className="space-y-4 disabled:cursor-not-allowed disabled:opacity-70">
        <div className="grid gap-2">
          <label htmlFor="password" className="text-sm font-medium">New password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="At least 8 characters"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="confirm_password" className="text-sm font-medium">Confirm password</label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Repeat your new password"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Set new password'}
        </button>
      </fieldset>
    </form>
  );
}

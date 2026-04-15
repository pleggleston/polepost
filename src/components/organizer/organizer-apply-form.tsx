'use client';

import { useActionState } from 'react';
import { applyAsOrganizer } from '@/app/(auth)/organizer-apply/actions';

type ActionState = { error: string | null };
const defaultState: ActionState = { error: null };

export function OrganizerApplyForm() {
  const [state, formAction, isPending] = useActionState(applyAsOrganizer, defaultState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Apply as organizer</h1>
        <p className="text-sm text-muted-foreground">
          Submit your organizer profile for admin review. Once approved, you can create and submit events.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{state.error}</p>
      ) : null}

      <fieldset disabled={isPending} className="space-y-4 disabled:cursor-not-allowed disabled:opacity-80">
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Organizer name <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={100}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="e.g. Midnight Collective"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="bio" className="text-sm font-medium">Bio</label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={500}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Tell us about your events and what you organize."
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="contact_email" className="text-sm font-medium">Contact email</label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="bookings@example.com"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="instagram_url" className="text-sm font-medium">Instagram URL</label>
          <input
            id="instagram_url"
            name="instagram_url"
            type="url"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="https://instagram.com/yourhandle"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Submitting…' : 'Submit application'}
        </button>
      </fieldset>
    </form>
  );
}

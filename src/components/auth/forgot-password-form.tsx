'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { requestPasswordReset } from '@/app/(public)/forgot-password/actions';

type ActionState = { error: string | null; sent?: boolean };
const defaultState: ActionState = { error: null };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, defaultState);

  if (state.sent) {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            If an account exists for that address, we sent a password reset link. Check your inbox (and spam folder).
          </p>
        </div>
        <Link href="/login" className="inline-flex text-sm font-medium text-primary hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="text-sm text-muted-foreground">Enter your email and we will send a reset link.</p>
      </div>

      {state.error ? (
        <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{state.error}</p>
      ) : null}

      <fieldset disabled={isPending} className="space-y-4 disabled:cursor-not-allowed disabled:opacity-70">
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Sending…' : 'Send reset link'}
        </button>
      </fieldset>

      <p className="text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

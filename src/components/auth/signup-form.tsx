'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signupWithPassword } from '@/app/(public)/auth-actions';

type AuthActionState = {
  error: string | null;
};

const initialState: AuthActionState = {
  error: null
};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupWithPassword, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-sm text-muted-foreground">Sign up with email and password.</p>
      </div>

      {state.error ? <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{state.error}</p> : null}

      <fieldset disabled={isPending} className="space-y-4 disabled:cursor-not-allowed disabled:opacity-70">
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
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

        <div className="grid gap-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
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
          <label htmlFor="display_name" className="text-sm font-medium">
            Display name (optional)
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            maxLength={80}
            autoComplete="nickname"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="How your name appears"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Creating account…' : 'Create account'}
        </button>
      </fieldset>

      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

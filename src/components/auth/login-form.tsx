'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { loginWithPassword } from '@/app/(public)/auth-actions';

type AuthActionState = {
  error: string | null;
};

const initialState: AuthActionState = {
  error: null
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginWithPassword, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="text-sm text-muted-foreground">Use your PolePost email and password.</p>
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
            autoComplete="current-password"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Logging in…' : 'Log in'}
        </button>
      </fieldset>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Need an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </p>
      </div>
    </form>
  );
}

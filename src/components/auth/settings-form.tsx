'use client';

import { useActionState } from 'react';
import type { OwnProfile } from '@/lib/auth/session';
import { requestVerification, updateProfileSettings } from '@/app/(auth)/settings/actions';

type ActionState = { error: string | null; success?: boolean };

const defaultState: ActionState = { error: null };

type SettingsFormProps = {
  profile: OwnProfile;
};

export function SettingsForm({ profile }: SettingsFormProps) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileSettings,
    defaultState
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    requestVerification,
    defaultState
  );

  const verificationStatus = profile.is_21_verified
    ? 'verified'
    : profile.requested_21_at
      ? 'pending'
      : 'none';

  return (
    <div className="space-y-6">
      {/* Profile edit section */}
      <section className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div>
          <h2 className="text-base font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">Update your display name, username, and location.</p>
        </div>

        <form action={profileAction} className="space-y-4">
          {profileState.error ? (
            <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{profileState.error}</p>
          ) : null}
          {profileState.success && !profileState.error ? (
            <p className="rounded-md bg-emerald-500/10 p-2 text-sm text-emerald-700">Profile saved successfully.</p>
          ) : null}

          <fieldset disabled={profilePending} className="space-y-4 disabled:cursor-not-allowed disabled:opacity-80">
            <div className="grid gap-2">
              <label htmlFor="display_name" className="text-sm font-medium">Display name</label>
              <input
                id="display_name"
                name="display_name"
                required
                minLength={2}
                maxLength={80}
                defaultValue={profile.display_name ?? ''}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Your display name"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <input
                id="username"
                name="username"
                required
                minLength={3}
                maxLength={30}
                defaultValue={profile.username ?? ''}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="your_username"
              />
              <p className="text-xs text-muted-foreground">Letters, numbers, and underscores only.</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="home_city" className="text-sm font-medium">Home city</label>
                <input
                  id="home_city"
                  name="home_city"
                  defaultValue={profile.home_city ?? ''}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. Los Angeles"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="home_state" className="text-sm font-medium">State</label>
                <input
                  id="home_state"
                  name="home_state"
                  defaultValue={profile.home_state ?? ''}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. CA"
                  maxLength={2}
                />
              </div>
            </div>

            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {profilePending ? 'Saving…' : 'Save profile'}
            </button>
          </fieldset>
        </form>
      </section>

      {/* 21+ verification section */}
      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div>
          <h2 className="text-base font-semibold">21+ Verification</h2>
          <p className="text-sm text-muted-foreground">
            Required to access age-restricted events. Admin review required.
          </p>
        </div>

        {verificationStatus === 'verified' ? (
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
            Verified 21+
          </p>
        ) : verificationStatus === 'pending' ? (
          <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            Your verification request is pending admin review.
          </p>
        ) : (
          <form action={verifyAction}>
            {verifyState.error ? (
              <p className="mb-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">{verifyState.error}</p>
            ) : null}
            <button
              type="submit"
              disabled={verifyPending}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verifyPending ? 'Submitting…' : 'Request 21+ verification'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type SaveEventButtonProps = {
  eventId: string;
  initialSaved: boolean;
  isAuthenticated: boolean;
  onSavedChange?: (saved: boolean) => void;
  className?: string;
};

export function SaveEventButton({ eventId, initialSaved, isAuthenticated, onSavedChange, className }: SaveEventButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const persistSaveState = async () => {
    if (!isAuthenticated) {
      setMessage('Sign in to save events.');
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage('Sign in to save events.');
        return;
      }

      if (saved) {
        const { error } = await supabase.from('saved_events').delete().eq('profile_id', user.id).eq('event_id', eventId);

        if (error) {
          throw new Error(error.message);
        }

        setSaved(false);
        onSavedChange?.(false);
        setMessage('Removed from saved events.');
        return;
      }

      const { error } = await supabase.from('saved_events').insert({
        profile_id: user.id,
        event_id: eventId
      });

      if (error && error.code !== '23505') {
        throw new Error(error.message);
      }

      setSaved(true);
      onSavedChange?.(true);
      setMessage(error?.code === '23505' ? 'Already in your saved events.' : 'Saved to your events list.');
    } catch {
      setMessage(saved ? 'Could not remove saved event right now.' : 'Could not save this event right now.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => void persistSaveState()}
        disabled={busy}
        className={
          className ??
          `inline-flex rounded-md px-3 py-2 text-sm font-semibold ${saved ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground'} disabled:cursor-not-allowed disabled:opacity-60`
        }
      >
        {busy ? 'Saving…' : saved ? 'Saved event' : 'Save event'}
      </button>
      {message ? (
        <p className="text-xs text-muted-foreground">
          {message} {!isAuthenticated ? <Link href="/" className="underline">Go to sign-in flow</Link> : null}
        </p>
      ) : null}
    </div>
  );
}

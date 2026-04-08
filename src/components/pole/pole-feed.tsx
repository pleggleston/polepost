'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { type PointerEventHandler, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PoleCard } from './pole-card';
import { PoleEmptyState } from './pole-empty-state';
import type { PoleEvent } from './types';

const SWIPE_THRESHOLD = 120;

export function PoleFeed({ events }: { events: PoleEvent[] }) {
  const [index, setIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    try {
      const browserSession = window.sessionStorage.getItem('pole_session_id');

      if (browserSession) {
        setSessionId(browserSession);
        return;
      }

      const generatedSession =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      window.sessionStorage.setItem('pole_session_id', generatedSession);
      setSessionId(generatedSession);
    } catch {
      const fallbackSession = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setSessionId(fallbackSession);
    }
  }, []);

  useEffect(() => {
    const hydrateUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();
        setUserId(user?.id ?? null);
      } catch {
        setUserId(null);
      }
    };

    void hydrateUser();
  }, []);

  const currentEvent = events[index] ?? null;
  const nextEvent = events[index + 1] ?? null;

  const advanceFeed = () => {
    setIndex((prev) => prev + 1);
  };

  const persistSwipe = async (eventId: string, action: 'dismiss' | 'save') => {
    if (!userId) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('event_swipes').insert({
      profile_id: userId,
      event_id: eventId,
      action,
      session_id: sessionId || null
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const persistSave = async (eventId: string) => {
    if (!userId) {
      setAuthMessage('Sign in to save events.');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('saved_events').insert({
      profile_id: userId,
      event_id: eventId
    });

    if (error && error.code !== '23505') {
      throw new Error(error.message);
    }
  };

  const handleSwipeAction = async (action: 'dismiss' | 'save') => {
    if (!currentEvent) {
      return;
    }

    setErrorMessage(null);
    setAuthMessage(null);

    try {
      if (action === 'save') {
        await persistSave(currentEvent.id);
      }

      await persistSwipe(currentEvent.id, action);
      advanceFeed();
    } catch {
      setErrorMessage(action === 'save' ? 'Could not save this event. Please try again.' : 'Could not dismiss this event right now.');
      advanceFeed();
    }
  };

  if (!currentEvent) {
    return (
      <div className="flex h-full items-center justify-center">
        <PoleEmptyState title="You reached the end" description="No more upcoming events right now." />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {errorMessage || authMessage ? (
        <div className="absolute left-2 right-2 top-2 z-20 rounded border border-black/20 bg-black/65 px-2 py-1 text-[11px] text-white">{errorMessage ?? authMessage}</div>
      ) : null}

      {nextEvent ? (
        <div className="pointer-events-none absolute inset-2 top-3 -z-10 opacity-55">
          <PoleCard event={nextEvent} />
        </div>
      ) : null}

      <AnimatePresence>
        <SwipeableCard key={currentEvent.id} event={currentEvent} onDismiss={() => void handleSwipeAction('dismiss')} onSave={() => void handleSwipeAction('save')} />
      </AnimatePresence>
    </div>
  );
}

function SwipeableCard({ event, onDismiss, onSave }: { event: PoleEvent; onDismiss: () => void; onSave: () => void }) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);

  const dismissOpacity = dragX < 0 ? Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1) : 0;
  const saveOpacity = dragX > 0 ? Math.min(dragX / SWIPE_THRESHOLD, 1) : 0;

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    setDragging(true);
    setStartX(event.clientX);
  };

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!dragging || startX === null) {
      return;
    }

    setDragX(event.clientX - startX);
  };

  const onPointerEnd = () => {
    if (dragX <= -SWIPE_THRESHOLD) {
      onDismiss();
    } else if (dragX >= SWIPE_THRESHOLD) {
      onSave();
    }

    setDragging(false);
    setStartX(null);
    setDragX(0);
  };

  return (
    <motion.div
      className="relative h-full touch-pan-x"
      style={{ transform: `translateX(${dragX}px) rotate(${dragX / 28}deg)`, transition: dragging ? 'none' : 'transform 180ms ease-out' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onPointerLeave={() => {
        if (dragging) {
          onPointerEnd();
        }
      }}
    >
      <div style={{ opacity: dismissOpacity }} className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white">
        DISMISS
      </div>
      <div style={{ opacity: saveOpacity }} className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-emerald-600/90 px-2.5 py-1 text-[11px] font-semibold text-white">
        SAVE
      </div>

      <PoleCard event={event} />
    </motion.div>
  );
}

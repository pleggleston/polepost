'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarActions } from '@/components/events/calendar-actions';
import type { SavedEventItem } from '@/lib/events/saved-events';
import { EventMeta } from './event-meta';
import { SaveEventButton } from './save-event-button';

type SavedEventsListProps = {
  initialItems: SavedEventItem[];
};

export function SavedEventsList({ initialItems }: SavedEventsListProps) {
  const [items, setItems] = useState(initialItems);

  const hasItems = items.length > 0;

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const aStartsAt = a.event?.starts_at ?? '';
        const bStartsAt = b.event?.starts_at ?? '';
        const startsAtSort = aStartsAt.localeCompare(bStartsAt);
        if (startsAtSort !== 0) {
          return startsAtSort;
        }

        const createdAtSort = b.created_at.localeCompare(a.created_at);
        if (createdAtSort !== 0) {
          return createdAtSort;
        }

        return a.event_id.localeCompare(b.event_id);
      }),
    [items]
  );

  if (!hasItems) {
    return <p className="rounded-xl border border-border bg-muted px-4 py-6 text-center text-sm text-muted-foreground">You have no saved events yet.</p>;
  }

  return (
    <div className="space-y-4">
      {sortedItems.map((item) => {
        if (!item.event) {
          return (
            <article key={item.event_id} className="space-y-3 rounded-xl border border-border p-4">
              <p className="text-sm font-semibold">Saved event unavailable</p>
              <p className="text-sm text-muted-foreground">This event is no longer available.</p>
              <SaveEventButton
                eventId={item.event_id}
                initialSaved
                isAuthenticated
                onSavedChange={(saved) => {
                  if (!saved) {
                    setItems((current) => current.filter((currentItem) => currentItem.event_id !== item.event_id));
                  }
                }}
              />
            </article>
          );
        }

        return (
          <article key={item.event_id} className="overflow-hidden rounded-xl border border-border bg-white">
            <Link href={`/events/${item.event.slug}`} className="block">
              {item.event.flyer_url ? (
                <Image src={item.event.flyer_url} alt={`Flyer for ${item.event.title}`} width={1200} height={800} unoptimized className="h-48 w-full object-cover" />
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-muted text-sm text-muted-foreground">Flyer coming soon</div>
              )}
            </Link>
            <div className="space-y-3 p-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {item.event.category?.label ? <span className="rounded-full bg-muted px-2 py-1">{item.event.category.label}</span> : null}
                  <span className="rounded-full bg-muted px-2 py-1 capitalize">{item.event.visibility}</span>
                </div>
                <Link href={`/events/${item.event.slug}`} className="block text-lg font-semibold leading-tight hover:underline">
                  {item.event.title}
                </Link>
              </div>

              <EventMeta event={item.event} />

              <div className="flex flex-col gap-2">
                <SaveEventButton
                  eventId={item.event.id}
                  initialSaved
                  isAuthenticated
                  onSavedChange={(saved) => {
                    if (!saved) {
                      setItems((current) => current.filter((currentItem) => currentItem.event_id !== item.event_id));
                    }
                  }}
                />
                <CalendarActions event={item.event} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

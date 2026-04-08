import { SavedEventsList } from '@/components/events/saved-events-list';
import { requireAuth } from '@/lib/auth/guards';
import { listSavedEventsForProfile } from '@/lib/events/saved-events';

export default async function SavedPage() {
  const user = await requireAuth();

  try {
    const savedEvents = await listSavedEventsForProfile(user.id);

    return (
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Saved events</h2>
          <p className="text-sm text-muted-foreground">Events you saved for later.</p>
        </div>

        <SavedEventsList initialItems={savedEvents} />
      </section>
    );
  } catch {
    return (
      <section className="space-y-2">
        <h2 className="text-2xl font-bold">Saved events</h2>
        <p className="rounded-xl border border-border bg-muted px-4 py-6 text-sm text-muted-foreground">We could not load your saved events right now.</p>
      </section>
    );
  }
}

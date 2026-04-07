import type { PublicEvent } from '@/lib/events/public-events';

function formatDateTime(startsAt: string, timezone: string): string {
  const date = new Date(startsAt);

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
    timeZoneName: 'short'
  }).format(date);
}

function formatLocation(event: PublicEvent): string {
  return `${event.city}, ${event.state}`;
}

function formatAgeRequirement(age: PublicEvent['age_requirement']): string {
  if (age === 'age_18_plus') return '18+';
  if (age === 'age_21_plus') return '21+';
  return 'All ages';
}

export function EventMeta({ event }: { event: PublicEvent }) {
  return (
    <div className="space-y-1 text-sm text-muted-foreground">
      <p>{formatDateTime(event.starts_at, event.timezone)}</p>
      <p>{event.venue_name}</p>
      <p>{formatLocation(event)}</p>
      <p>{formatAgeRequirement(event.age_requirement)}</p>
    </div>
  );
}

export type CalendarEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  venue_name: string;
  address_line1: string | null;
  city: string;
  state: string;
};

function toCalendarTimestamp(value: Date): string {
  return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function safeDate(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function sanitizeText(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function buildGoogleCalendarLink(event: CalendarEvent): string | null {
  const startsAt = safeDate(event.starts_at);
  if (!startsAt) {
    return null;
  }

  const endsAt = event.ends_at ? safeDate(event.ends_at) : null;
  const effectiveEnd = endsAt ?? startsAt;

  const datesParam = `${toCalendarTimestamp(startsAt)}/${toCalendarTimestamp(effectiveEnd)}`;
  const location = [event.venue_name, event.address_line1, `${event.city}, ${event.state}`].filter(Boolean).join(', ');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: sanitizeText(event.title, 'PolePost Event'),
    dates: datesParam,
    details: sanitizeText(event.description, 'Find details in PolePost.'),
    location: sanitizeText(location, `${event.city}, ${event.state}`)
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsContent(event: CalendarEvent): string | null {
  const startsAt = safeDate(event.starts_at);
  if (!startsAt) {
    return null;
  }

  const endsAt = event.ends_at ? safeDate(event.ends_at) : null;
  const effectiveEnd = endsAt ?? startsAt;
  const createdAt = toCalendarTimestamp(new Date('2026-01-01T00:00:00.000Z'));
  const location = [event.venue_name, event.address_line1, `${event.city}, ${event.state}`].filter(Boolean).join(', ');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PolePost//MVP//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@polepost.local`,
    `DTSTAMP:${createdAt}`,
    `DTSTART:${toCalendarTimestamp(startsAt)}`,
    `DTEND:${toCalendarTimestamp(effectiveEnd)}`,
    `SUMMARY:${escapeIcsText(sanitizeText(event.title, 'PolePost Event'))}`,
    `DESCRIPTION:${escapeIcsText(sanitizeText(event.description, 'Find details in PolePost.'))}`,
    `LOCATION:${escapeIcsText(sanitizeText(location, `${event.city}, ${event.state}`))}`,
    `URL:https://polepost.local/events/${event.slug}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function buildIcsDownloadUrl(event: CalendarEvent): string | null {
  const icsContent = buildIcsContent(event);
  if (!icsContent) {
    return null;
  }

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
}

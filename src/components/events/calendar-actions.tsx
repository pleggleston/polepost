import { buildGoogleCalendarLink, buildIcsDownloadUrl, type CalendarEvent } from '@/lib/calendar/event-calendar';

type CalendarActionsProps = {
  event: CalendarEvent;
};

export function CalendarActions({ event }: CalendarActionsProps) {
  const googleCalendarUrl = buildGoogleCalendarLink(event);
  const icsDownloadUrl = buildIcsDownloadUrl(event);

  if (!googleCalendarUrl && !icsDownloadUrl) {
    return <p className="text-xs text-muted-foreground">Calendar actions unavailable for this event.</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {googleCalendarUrl ? (
        <a href={googleCalendarUrl} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
          Add to Google Calendar
        </a>
      ) : null}
      {icsDownloadUrl ? (
        <a href={icsDownloadUrl} download={`${event.slug || event.id}.ics`} className="font-medium text-primary hover:underline">
          Download .ics
        </a>
      ) : null}
    </div>
  );
}

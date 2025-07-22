import { useAppStore } from '@lib/store';
import type { CalendarEvent } from '@clientTypes/calendarEvent';

type StructuredResponseProps = {
  event: CalendarEvent;
};

export function StructuredResponse({ event }: StructuredResponseProps) {
  const setRange = useAppStore((state) => state.setRange);

  const handleClick = () => {
    const start = new Date(event.date_unix * 1000);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    setRange({ start, end, itemId: `event-slot-${event.id}` });
  };

  const date = new Date(event.date);

  return (
    <div
      key={`structured-response-${event.id}`}
      onClick={handleClick}
      style={{
        padding: '1lh 1ch',
        margin: '0.5lh 2ch',
        maxWidth: '37ch',
        backgroundColor: `var(--${event?.color})`,
        color: `var(--background0)`,
        cursor: 'pointer',
      }}
    >
      <p style={{ margin: '0lh 1ch', color: `var(--background0)` }}>
        {event?.name}
      </p>
      <p style={{ margin: '1lh 1ch 0lh 1ch', color: `var(--background3)` }}>
        {`${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`}
      </p>
      <p style={{ margin: '0lh 1ch', color: `var(--background3)` }}>
        {`For ${event?.duration} minutes`}
      </p>
      <p style={{ margin: '1lh 1ch 0lh 1ch', color: `var(--background3)` }}>
        Description:
      </p>
      <blockquote style={{ margin: '0lh 1ch', color: `var(--background0)` }}>
        {event.description}
      </blockquote>
    </div>
  );
}

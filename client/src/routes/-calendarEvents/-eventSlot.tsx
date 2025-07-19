import type { CalendarEventTable } from '@server/schemas/calendarEvent.ts';
import { css } from '@stitches/react';
import { CreateEventDialog } from './-createEventDialog';

export type CalendarEvent = Omit<CalendarEventTable, 'date' | 'deleted_at'> & {
  date: string;
};

export interface eventSlotProps {
  events: CalendarEvent[] | undefined;
  refetch: () => void;
}

export function EventSlot({ events, refetch }: eventSlotProps) {
  return (
    <>
      {events &&
        events.map((event) => {
          const date = new Date(event.date);
          const hours = date.getHours();
          const minutes = Math.floor(date.getMinutes() / 15) * 15;

          const top = hours * 6 + (minutes >= 30 ? 4 : 1);
          const height = event.duration / 10 - 1;

          return (
            <>
              <div
                popoverTarget={`dialog-${event.id}`}
                key={`event-slot-${event.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById(`dialog-${event.id}`)
                    ?.togglePopover();
                }}
                className={eventBox()}
                style={{
                  top: `${top}lh`,
                  height: `${height}lh`,
                  backgroundColor: `var(--${event.color})`,
                }}
              >
                {event.duration >= 30 ? event.name : ''}
              </div>

              <CreateEventDialog
                key={`event-slot-dialog-${event.id}`}
                existing={event}
                onSubmit={refetch}
                idSuffix={event.id}
              />
            </>
          );
        })}
    </>
  );
}

const eventBox = css({
  position: 'absolute',
  padding: '0.5lh 1ch',
  left: '7ch',
  right: 0,
  margin: '0lh 1ch',
  color: 'var(--base)',
});

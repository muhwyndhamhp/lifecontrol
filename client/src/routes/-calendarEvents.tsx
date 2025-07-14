import { createStitches } from '@stitches/react';
import { Fragment, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { client, rpcFetch } from '../fetcher';

export function CalendarEvents() {
  const date = new Date();
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
  const end = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
    0,
    0,
    0,
    0,
  );

  const { data: events } = useQuery({
    queryKey: ['calendarEvents', start, end],
    queryFn: rpcFetch(client.api.events.$get)({
      query: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
    }),
  });

  const intervals: { label: string; isHour: boolean }[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const label = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      intervals.push({
        label,
        isHour: minute === 0,
      });
    }
  }

  // Fix: useRef as a map of string to HTMLDivElement | null
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const date = new Date();
    const el =
      itemRefs.current[
        `calendar-row-${intervals.findIndex((v) => v.label == `${date.getHours()}:00`)}`
        ];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  return (
    <>
      <div box-={'round'} shear-={'top'} className={box()}>
        <div className={header()}>
          <span is-="badge" variant-="background0">
            Upcoming Event
          </span>
        </div>
        <div className={content()}>
          {intervals.map((slot, idx) => {
            const key = `calendar-row-${idx}`;
            const lastItem = idx === intervals.length - 1;
            return (
              <Fragment key={key}>
                {slot.isHour && (
                  <div
                    is-="separator"
                    className={separator()}
                    ref={(el) => {
                      itemRefs.current[key] = el;
                    }}
                  ></div>
                )}
                <div>{slot.label}</div>
                {lastItem && (
                  <div is-="separator" className={separator()}></div>
                )}
              </Fragment>
            );
          })}
          {events && events.map((event, idx) => {
            const date = new Date(event.date);
            const minutesSinceMidnight =
              date.getHours() * 60 + date.getMinutes();
            const top = (minutesSinceMidnight / 968) * 100 - 1; // % of day
            const height = (event.duration / 1440) * 100; // % of day

            return (
              <div
                key={idx}
                className={eventBox()}
                style={{
                  top: `${top}lh`,
                  height: `${height}lh`,
                  backgroundColor: `var(--${event.color})`,
                }}
              >
                {event.name}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// Styles
const { css } = createStitches();

const header = css({
  display: 'flex',
  justifyContent: 'space-between',
});
const content = css({
  position: 'relative',
  padding: '0lh 1ch',
  display: 'flex',
  flexDirection: 'column',
  gap: '1lh',
  height: '96%',
  overflowY: 'scroll',
});

const eventBox = css({
  position: 'absolute',
  padding: '0.5lh 1ch',
  left: '7ch',
  right: 0,
  margin: '0lh 1ch',
  color: 'var(--base)',
});

const box = css({
  maxHeight: '100%',
  height: '25lh',
  width: '50ch',
  '--box-border-color': 'var(--background3)',
});

const separator = css({
  width: '100%',
  minHeight: '1lh',
  '--separator-color': 'var(--background3)',
});

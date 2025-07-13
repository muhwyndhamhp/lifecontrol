import { createStitches } from '@stitches/react';
import '../index.css';
import { Fragment, useEffect, useRef } from 'react';

export function CalendarEvents() {
  const date = new Date();
  const events: { name: string; date: Date; duration: number, color: 'mauve' | 'teal' | 'flamingo' }[] = [
    {
      name: 'Lunch Hour',
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0),
      duration: 60,
      color: 'mauve',
    },
    {
      name: 'Meeting',
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 30, 0, 0),
      duration: 120,
      color: 'teal',
    },
    {
      name: 'Dinner With Family. Don\'t forget to bring the gift',
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 56, 0, 0),
      duration: 92,
      color: 'flamingo',
    },
  ];

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
    const el = itemRefs.current[`calendar-row-${intervals.findIndex((v) => v.label == `${date.getHours()}:00`)}`];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  return (
    <>
      <div box-={'round'} shear-={'top'} className={box()}>
        <div className={header()}>
          <span is-="badge" variant-="background0">Upcoming Event</span>
        </div>
        <div className={content()}>
          {intervals.map((slot, idx) => {
            const key = `calendar-row-${idx}`;
            const lastItem = idx === intervals.length - 1;
            return (
              <Fragment key={key}>
                {slot.isHour &&
                  <div
                    is-="separator"
                    className={separator()}
                    ref={(el) => { itemRefs.current[key] = el; }}
                  ></div>}
                <div>{slot.label}</div>
                {lastItem && <div is-="separator" className={separator()}></div>}
              </Fragment>
            );
          })}
          {events.map((event, idx) => {
            const minutesSinceMidnight =
              event.date.getHours() * 60 + event.date.getMinutes();
            const top = ((minutesSinceMidnight / 968) * 100) - 1; // % of day
            const height = ((event.duration / 1440) * 100); // % of day

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
  padding: '1lh 2ch',
  left: '7ch',
  right: 0,
  margin: '0lh 1ch',
  color: 'var(--base)',
});

const box = css({
  maxHeight: '100%',
  height: '20lh',
  width: '50ch',
  '--box-border-color': 'var(--background3)',
});

const separator = css({
  width: '100%',
  minHeight: '1lh',
  '--separator-color': 'var(--background3)',
});

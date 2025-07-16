import { css } from '@stitches/react';
import { Fragment, useEffect, useRef } from 'react';

export function TimeSlot() {
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
            {lastItem && <div is-="separator" className={separator()}></div>}
          </Fragment>
        );
      })}
    </>
  );
}

const separator = css({
  width: '100%',
  minHeight: '1lh',
  '--separator-color': 'var(--background3)',
});

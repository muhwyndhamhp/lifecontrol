import { getHourIntervals } from '@lib/toolbox';
import { css } from '@stitches/react';
import { Fragment, useRef } from 'react';

export function TimeSlot() {
  const intervals = getHourIntervals();
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  return (
    <>
      {intervals.map((slot, idx) => {
        const key = `calendar-row-${idx}`;
        const lastItem = idx === intervals.length - 1;
        return (
          <Fragment key={key}>
            {slot.isHour && (
              <div
                id={key}
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

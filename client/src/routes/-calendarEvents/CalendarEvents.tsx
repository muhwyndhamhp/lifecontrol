import { css } from '@stitches/react';
import { useQuery } from '@tanstack/react-query';
import { client, rpcFetch } from '@lib/fetcher.ts';
import { TimeSlot } from './components/TimeSlot.tsx';
import { EventSlot } from './components/EventSlot.tsx';
import { CreateEventDialog } from './components/CreateEventDialog.tsx';
import { useAppStore } from '@lib/store.ts';
import { useEffect, useRef } from 'react';
import { getHourIntervals } from '@lib/toolbox.ts';

export function CalendarEvents() {
  const keys = useAppStore((state) => state.keys);

  const { start, end, itemId } = useAppStore((state) => state.range);
  const refetch = useAppStore((state) => state.refetch);
  const toggleRefetch = useAppStore((state) => state.toggleRefetch);
  const nextDay = useAppStore((state) => state.nextDay);
  const previousDay = useAppStore((state) => state.previousDay);

  const divRef = useRef<HTMLDivElement>(null);

  function handleDateKey(k: string[]) {
    const toPrevious = k.findIndex((v) => v === '<') !== -1;
    const toNext = k.findIndex((v) => v === '>') !== -1;

    if (toPrevious && toNext) return;
    if (!toPrevious && !toNext) return;

    toPrevious ? previousDay() : nextDay();
  }

  function handleScroll(k: string[]) {
    const goUp = k.findIndex((v) => v === 'k') !== -1;
    const goDown = k.findIndex((v) => v === 'j') !== -1;

    if (goUp && goDown) return;
    if (!goUp && !goDown) return;

    if (goUp) divRef?.current?.scrollBy({ top: -200, behavior: 'smooth' });
    if (goDown) divRef?.current?.scrollBy({ top: 200, behavior: 'smooth' });
  }

  function handleCreate(k: string[]) {
    const openDialog =
      k.findIndex((v) => v.toLowerCase() === 'a') !== -1;

    if (openDialog) document.getElementById('dialog')?.togglePopover();
  }

  useEffect(() => {
    handleDateKey(keys);
    handleScroll(keys);
    handleCreate(keys);
  }, [keys]);

  const {
    data: events,
    isLoading,
    refetch: refetching,
  } = useQuery({
    queryKey: ['calendarEvents', start, end],
    queryFn: rpcFetch(client.api.events.$get)({
      query: {
        startDate: (start.getTime() / 1000).toString(),
        endDate: (end.getTime() / 1000).toString(),
      },
    }),
  });

  useEffect(() => {
    const a = async () => {
      if (refetch) {
        await refetching();
        toggleRefetch();
      }

      const date = new Date();
      const el = document.getElementById(
        `calendar-row-${getHourIntervals().findIndex((v) => v.label == `${date.getHours()}:00`)}`
      );

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (itemId) {
        document
          .getElementById(itemId)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    a();
  }, [refetch, refetching, toggleRefetch, itemId, start]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div box-={'round'} shear-={'top'} className={box()}>
        <div className={header()}>
          <span is-="badge" variant-="background0">
            [ Schedules
            <span
              is-="spinner"
              variant-="bar-vertical"
              className={isLoading ? spinnerLoading() : spinnerHidden()}
            ></span>
            ]
          </span>
          <span is-="badge" variant-="background0">
            <span onClick={previousDay} className={spannableButton()}>
              {'<'}
            </span>
            {start.toLocaleDateString('id-ID')}
            <span onClick={nextDay} className={spannableButton()}>
              {'>'}
            </span>
          </span>
        </div>
        <div className={content()} ref={divRef}>
          <TimeSlot />
          <EventSlot events={events} refetch={refetching} />
        </div>
      </div>
      <button popoverTarget={'dialog'} className={createButton()}>
        Add Event
      </button>
      <CreateEventDialog onSubmit={refetching} />
    </div>
  );
}

const createButton = css({
  margin: '0lh auto',
  width: 'calc(100% - 1ch)',
});

const spannableButton = css({
  margin: '0lh 1ch',
  cursor: 'pointer',
  userSelect: 'none',
});

const spinnerHidden = css({
  visibility: 'hidden',
  margin: 0,
});

const spinnerLoading = css({
  visibility: 'inherit',
  margin: '0lh 1ch',
});
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

const box = css({
  height: 'calc(100vh - 7lh)',
  width: '50ch',
  '--box-border-color': 'var(--background3)',
});

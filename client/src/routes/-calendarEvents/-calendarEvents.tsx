import { css } from '@stitches/react';
import { useQuery } from '@tanstack/react-query';
import { client, rpcFetch } from '../../fetcher.ts';
import { TimeSlot } from './-timeSlot.tsx';
import { EventSlot } from './-eventSlot.tsx';
import { CreateEventDialog } from './-createEventDialog.tsx';
import { useAppStore } from '../../store.ts';
import { useEffect } from 'react';

export function CalendarEvents() {
  const { start, end } = useAppStore((state) => state.range);
  const refetch = useAppStore((state) => state.refetch);
  const toggleRefetch = useAppStore((state) => state.toggleRefetch);
  const nextDay = useAppStore((state) => state.nextDay);
  const previousDay = useAppStore((state) => state.previousDay);

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
    };

    a();
  }, [refetch, refetching, toggleRefetch]);

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
        <div className={content()}>
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

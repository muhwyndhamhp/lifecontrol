import { css } from '@stitches/react';
import { useQuery } from '@tanstack/react-query';
import { client, rpcFetch } from '../../fetcher.ts';
import { TimeSlot } from './-timeSlot.tsx';
import { EventSlot } from './-eventSlot.tsx';
import { useState } from 'react';
import { CreateEventDialog } from './-createEventDialog.tsx';

export function CalendarEvents() {
  const [start, setStart] = useState(new Date());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const {
    data: events,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['calendarEvents', start, end],
    queryFn: rpcFetch(client.api.events.$get)({
      query: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
    }),
  });

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
            <span
              onClick={() =>
                setStart(new Date(start.setDate(start.getDate() - 1)))
              }
              className={spannableButton()}
            >
              {'<'}
            </span>
            {start.toLocaleDateString('id-ID')}
            <span
              onClick={() =>
                setStart(new Date(start.setDate(start.getDate() + 1)))
              }
              className={spannableButton()}
            >
              {'>'}
            </span>
          </span>
        </div>
        <div className={content()}>
          <TimeSlot />
          <EventSlot events={events} refetch={refetch} />
        </div>
      </div>
      <button popoverTarget={'dialog'} className={createButton()}>
        Add Event
      </button>
      <CreateEventDialog onSubmit={refetch} />
    </div>
  );
}

const createButton = css({
  marginLeft: 'auto',
  marginRight: '0.3ch',
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
  maxHeight: '100%',
  height: '30lh',
  width: '50ch',
  '--box-border-color': 'var(--background3)',
});

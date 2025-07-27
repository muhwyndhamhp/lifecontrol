import { getTokens } from '@lib/cookies';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { client, rpcFetch } from '@lib/fetcher';
import { css } from '@stitches/react';

export const Route = createFileRoute('/onboarding')({
  component: RouteComponent,
  beforeLoad: async () => {
    const { access, refresh } = getTokens();
    if (!access && !refresh) throw redirect({ to: '/welcome' });
  },
});

function RouteComponent() {
  const { access } = getTokens();
  const { data, isLoading } = useQuery({
    queryKey: ['calendar-select', access],
    queryFn: rpcFetch(client.api.calendars.$get)({}),
  });

  if (isLoading) {
    return (
      <div className={welcomeBox()}>
        <p style={{ margin: 'auto' }}>
          <span is-="spinner" variant-="dots"></span>Loading calendar info...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={welcomeBox()}>
        <p style={{ margin: 'auto' }}>Data Error</p>
      </div>
    );
  }

  if (!data.success) {
    return (
      <div className={welcomeBox()}>
        <div className={formContent()}>
          {data.errors.map((v) => {
            return <p>{v.message}</p>;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={welcomeBox()}>
      <form box-="round" style={{ margin: 'auto' }}>
        <div className={formContent()}>
          <p style={{ textAlign: 'justify' }}>
            Select your calendar to use within Life Control:
          </p>

          {data.calendars?.items.map((c, idx) => (
            <label>
              <input
                type="radio"
                name="color"
                value={c.id}
                defaultChecked={idx === 0}
              />
              <span>{c.summaryOverride ?? c.summary}</span>
            </label>
          ))}
          <button>Continue</button>
        </div>
      </form>
    </div>
  );
}

const formContent = css({
  maxWidth: '40ch',
  display: 'flex',
  padding: '0lh 1ch',
  gap: '1lh',
  flexDirection: 'column',
});

const welcomeBox = css({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: 'calc(100vh - 4lh)',
});

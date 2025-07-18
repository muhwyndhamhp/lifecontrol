import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { css } from '@stitches/react';

export const Route = createRootRoute({
  component: () => (
    <div className={root()}>
      <div shear-={'top'} box-={'round'} className={box()}>
        <div className={header()}>
          <span is-="badge" variant-="flamingo" cap-={'square triangle'}>
            Life Control{' >>'}
          </span>
        </div>
        <div>
          <Outlet />
          <TanStackRouterDevtools />
        </div>
      </div>
    </div>
  ),
});

const box = css({
  height: '100%',
  width: '100%',
  '--box-border-color': 'var(--background3)',
});

const root = css({
  padding: '1lh 2ch',
  height: '100vh',
  width: '100vw',
});

const header = css({
  display: 'flex',
  fontWeight: 'bolder',
  justifyContent: 'space-between',
  padding: '0lh 1ch',
  whiteSpace: 'pre',
});

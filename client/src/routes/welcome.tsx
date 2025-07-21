import { css } from '@stitches/react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/welcome')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className={welcomeBox()}>
      <div
        style={{
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '80ch',
        }}
      >
        <pre className={ascii()}>
          {`
 _      ____  _____  ___         __   ___   ____   ______  ____   ___   _
| |    |    ||     |/  _]       /  ] /   \\ |    \\ |      ||    \\ /   \\ | |
| |     |  | |   __/  [_       /  / |     ||  _  ||      ||  D  )     || |
| |___  |  | |  |_|    _]     /  /  |  O  ||  |  ||_|  |_||    /|  O  || |___
|     | |  | |   _]   [_     /   \\_ |     ||  |  |  |  |  |    \\|     ||     |
|     | |  | |  | |     |    \\     ||     ||  |  |  |  |  |  .  \\     ||     |
|_____||____||__| |_____|     \\____| \\___/ |__|__|  |__|  |__|\\_|\\___/ |_____|
        `}
        </pre>
        <p>Welcome to Life Control, Your Personal Calendar Assistant</p>
        <div is-="separator"></div>
        <div box-="round" style={{ padding: '2lh 4ch' }}>
          <p>
            You can manage your calendar events throughout the day using a
            Friendly TUI interface. Powered by LLM, you can just ask them in a
            natural manner what you need to get done for the day.
          </p>
        </div>
        <div is-="separator"></div>
        <button
          is-="button"
          size-="large"
          onClick={() => {
            location.href = '/authorize';
          }}
          variant-="lavender"
        >
          Login to Continue
        </button>
      </div>
    </div>
  );
}

const welcomeBox = css({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: 'calc(100vh - 4lh)',
});

const ascii = css({
  width: '80ch',
  color: 'var(--flamingo)',
});

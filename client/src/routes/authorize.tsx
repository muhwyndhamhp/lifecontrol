import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '@auth/client.ts';
import { useEffect } from 'react';
import { css } from '@stitches/react';

export const Route = createFileRoute('/authorize')({
  component: RouteComponent,
});

function RouteComponent() {
  const cl = authClient(import.meta.env.VITE_ISSUER_URL);
  const stage = import.meta.env.VITE_APP_STAGE;

  useEffect(() => {
    const redirect = async () => {
      const { challenge, url } = await cl.authorize(
        `${stage === 'production' ? 'https://lifecontrol.mwyndham.dev' : 'http://localhost:5173'}/callback`,
        'code',
        { pkce: true }
      );
      sessionStorage.setItem('challenge-key', JSON.stringify(challenge));
      window.location.href = url;
    };

    redirect();
  }, []);
  return (
    <div className={welcomeBox()}>
      <p style={{ margin: 'auto' }}>Redirecting you to identity provider...</p>
    </div>
  );
}

const welcomeBox = css({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: 'calc(100vh - 4lh)',
});

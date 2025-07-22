import { css } from '@stitches/react';

export function WelcomeMessage() {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div className={welcomeMessageBox()}>
        <p>Welcome to Life Control!</p>
        <p style={{ textAlign: 'justify', margin: '1lh 0ch' }}>
          To add event you can press "Add Event" below or pressing{' '}
          <span className={keybind()}>`a`</span> button on your keyboard.
        </p>
        <p style={{ textAlign: 'justify', margin: '1lh 0ch' }}>
          Or you can press either <span className={keybind()}>`i`</span> or{' '}
          <span className={keybind()}>`/`</span> to focus on the input to start
          chatting with the calendar assistant.
        </p>
      </div>
    </div>
  );
}

const welcomeMessageBox = css({
  width: '40ch',
  margin: 'auto',
  textAlign: 'center',
});

const keybind = css({
  color: 'var(--red)',
});

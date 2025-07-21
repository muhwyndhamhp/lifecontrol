import { css } from '@stitches/react';
import type { KeyboardEvent } from 'react';
import { useChat } from '../useChat';

type ChatInputProps = {
  onSubmit: (message: string) => void;
};

export function ChatInput({ onSubmit }: ChatInputProps) {
  const { clearHistory } = useChat()

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      onSubmit(e.currentTarget.value);
      e.currentTarget.value = '';
    }
  };

  return (
    <div className={horizontalDiv()}>
      <label box-="round" shear-="top" className={chatInputLabel()}>
        <div className={chatInputContainer()}>
          <span is-="badge" variant-="background0">
            Chat Input
          </span>
        </div>
        <input
          name="name"
          onKeyUp={handleKeyUp}
          className={inputBox()}
          placeholder="When "
        />
      </label>
      <button style={{ height: '100%' }} onClick={() => { clearHistory() }}>Clear History</button>
    </div>
  );
}
const horizontalDiv = css({
  display: 'flex',
  flexDirection: 'row',
});

const chatInputLabel = css({
  'flex-grow': 1,
});

const chatInputContainer = css({
  display: 'flex',
});

const inputBox = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5lh',
  color: 'var(--text)',
  padding: '0lh 1ch',
  fontFamily: 'Zed Mono',
  width: '100%',
  background: 'var(--background0)',
  borderColor: 'transparent',
});

import { css } from '@stitches/react';
import type { KeyboardEvent } from 'react';

type ChatInputProps = {
  onSubmit: (message: string) => void;
};

export function ChatInput({ onSubmit }: ChatInputProps) {
  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      onSubmit(e.currentTarget.value);
      e.currentTarget.value = '';
    }
  };

  return (
    <label box-="round" shear-="top">
      <div style={{ display: 'flex' }}>
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
  );
}

const inputBox = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5lh',
  color: 'var(--text)',
  padding: '0.25lh 1ch',
  fontFamily: 'Zed Mono',
  width: '100%',
  background: 'var(--background0)',
  borderColor: 'transparent',
});

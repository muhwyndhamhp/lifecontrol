import { css } from '@stitches/react';
import { ChatHistory } from './components/ChatHistory.tsx';
import { ChatInput } from './components/ChatInput.tsx';
import { useChat } from './useChat.ts';

export function ChatBox() {
  const { chatHistory, loading, submitPrompt } = useChat();

  return (
    <>
      <div className={chatBox()}>
        <div
          box-="round"
          style={{
            padding: '1lh 1ch',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 7lh)',
          }}
        >
          <ChatHistory chatHistory={chatHistory} loading={loading} />
        </div>
        <ChatInput onSubmit={submitPrompt} />{' '}
      </div>
    </>
  );
}

const chatBox = css({
  width: '100%',
  height: 'calc(100vh - 4lh)',
  margin: '0lh 1ch 0lh 0ch',
  display: 'flex',
  flexDirection: 'column',
});

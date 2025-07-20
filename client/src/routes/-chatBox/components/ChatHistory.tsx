import { css } from '@stitches/react';
import { useEffect } from 'react';
import type { ChatMessage } from '../useChat.ts';
import { ChatMessageItem } from './components/ChatMessageItem.tsx';

type ChatHistoryProps = {
  chatHistory: ChatMessage[];
  loading: boolean;
};

export function ChatHistory({ chatHistory, loading }: ChatHistoryProps) {
  useEffect(() => {
    document
      .getElementById(`chat-history-${chatHistory.length - 1}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [chatHistory]);

  return (
    <div className={chatHistoryContainer()}>
      {chatHistory.map((v, idx) => (
        <ChatMessageItem key={idx} chatMessage={v} index={idx} />
      ))}
      {loading && (
        <div className={loadingIndicator()}>
          <span>
            <span is-="spinner" variant-="dots"></span> Working...
          </span>
        </div>
      )}
    </div>
  );
}

const chatHistoryContainer = css({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'scroll',
  width: '100%',
});

const loadingIndicator = css({
  padding: '1lh 2ch',
  backgroundColor: 'var(--background2)',
});

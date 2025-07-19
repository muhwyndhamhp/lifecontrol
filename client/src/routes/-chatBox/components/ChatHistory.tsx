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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'scroll',
        width: '100%',
      }}
    >
      {chatHistory.map((v, idx) => (
        <ChatMessageItem key={idx} chatMessage={v} index={idx} />
      ))}
      {loading && (
        <div
          style={{
            padding: '1lh 2ch',
            backgroundColor: 'var(--background2)',
          }}
        >
          <span>
            <span is-="spinner" variant-="dots"></span> Working...
          </span>
        </div>
      )}
    </div>
  );
}

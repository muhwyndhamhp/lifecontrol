import { useEffect } from 'react';
import type { ChatMessage } from '../../useChat.ts';
import { ChatMessageItem } from './components/chatMessageItem/ChatMessageItem.tsx';
import { LoadingIndicator } from './components/LoadingIndicator.tsx';

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
      {loading && <LoadingIndicator />}
    </div>
  );
}

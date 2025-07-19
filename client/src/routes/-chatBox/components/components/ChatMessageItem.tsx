import type { ChatMessage } from '../../useChat.ts';
import { StructuredResponse } from './components/StructuredResponse.tsx';

type ChatMessageItemProps = {
  chatMessage: ChatMessage;
  index: number;
};

export function ChatMessageItem({ chatMessage, index }: ChatMessageItemProps) {
  return (
    <div
      id={`chat-history-${index}`}
      style={{
        padding: '1lh 2ch',
        display: 'flex',
        flexDirection: 'column',
        margin: chatMessage.author === 'client' ? '0lh 0ch 0lh auto' : '',
        backgroundColor:
          chatMessage.author === 'client'
            ? 'var(--background0)'
            : 'var(--background2)',
      }}
    >
      <span>{`"${chatMessage.message}"`}</span>
      {chatMessage.structuredResponse?.map((event) => (
        <StructuredResponse key={event.id} event={event} />
      ))}
    </div>
  );
}

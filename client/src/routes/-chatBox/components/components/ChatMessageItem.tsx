import { css } from '@stitches/react';
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
      className={chatMessageItem(chatMessage.author)}
    >
      <span>{`"${chatMessage.message}"`}</span>
      {chatMessage.structuredResponse?.map((event) => (
        <StructuredResponse key={event.id} event={event} />
      ))}
    </div>
  );
}

const chatMessageItem = (author: 'client' | 'server') =>
  css({
    padding: '1lh 2ch',
    display: 'flex',
    flexDirection: 'column',
    margin: author === 'client' ? '0lh 0ch 0lh auto' : '',
    backgroundColor:
      author === 'client' ? 'var(--background0)' : 'var(--background2)',
  })();

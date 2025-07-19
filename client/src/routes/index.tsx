import { createFileRoute } from '@tanstack/react-router';
import { CalendarEvents } from './-calendarEvents/-calendarEvents.tsx';
import { ChatBox } from './-chatBox/ChatBox.tsx';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div
      style={{
        padding: '0lh 1ch',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row-reverse',
        }}
      >
        <CalendarEvents />
        <ChatBox />
      </div>
    </div>
  );
}

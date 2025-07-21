import { createFileRoute, redirect } from '@tanstack/react-router';
import { CalendarEvents } from './-calendarEvents/CalendarEvents.tsx';
import { ChatBox } from './-chatBox/ChatBox.tsx';
import { getTokens } from '@lib/cookies.ts';

export const Route = createFileRoute('/')({
  component: Index,

  beforeLoad: async () => {
    const { access, refresh } = getTokens();
    if (!access && !refresh) throw redirect({ to: '/authorize' });
  },
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

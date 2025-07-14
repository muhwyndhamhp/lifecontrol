import { createFileRoute } from '@tanstack/react-router';
import { CalendarEvents } from './-calendarEvents.tsx';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div style={{
      padding: '0lh 1ch',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        marginLeft: 'auto'
      }}>
        <CalendarEvents />
      </div>
    </div>
  );
}

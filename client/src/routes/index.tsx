import { createFileRoute } from '@tanstack/react-router';
import { CalendarEvents } from './-calendarEvents.tsx';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div style={{
      paddingTop: '1lh',
      paddingBottom: '1lh',
      paddingLeft: '1ch',
      paddingRight: '1ch',
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

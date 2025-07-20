import type { CalendarEventTable } from '@server/schemas/calendarEvent.ts';

export type CalendarEvent = Omit<
  CalendarEventTable,
  'date' | 'deleted_at' | 'color'
> & {
  date: string;
  color: string;
};

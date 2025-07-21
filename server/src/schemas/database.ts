import { CalendarEventTable } from './calendarEvent';

export interface Database {
  calendar_events: CalendarEventTable;
}

export type ValidationCache = {
  access: string;
  refresh: string;
  user_id: number;
  oauth_id: string;
  email: string;
  expiry_timestamp: number;
};

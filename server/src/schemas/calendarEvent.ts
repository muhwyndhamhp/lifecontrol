import { custom, date, minLength, object, pipe, string } from 'valibot';
import { validate, version } from 'uuid';

const isUuidV4 = (id: string) => validate(id) && version(id) === 4;

export const updateCalendarEventSchema = object({
  id: pipe(
    string(),
    custom((value) => {
      return isUuidV4(value as string);
    }),
  ),
  name: pipe(string(), minLength(1)),
  date: pipe(date()),
});

export const createCalendarEventSchema = object({
  name: pipe(string(), minLength(1)),
  date: pipe(date()),
});

export interface CalendarEventTable {
  id: string;
  name: string;
  date: Date | string;
}

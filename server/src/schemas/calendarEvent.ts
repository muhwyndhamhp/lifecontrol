import {
  custom,
  fallback,
  maxValue,
  minValue,
  number,
  object,
  optional,
  picklist,
  pipe,
  string,
  transform,
  union,
} from 'valibot';
import { validate, version } from 'uuid';
import { dateTime } from './helper';

const isUuidV4 = (id: string) => validate(id) && version(id) === 4;

export const Colors = [
  'mauve',
  'teal',
  'flamingo',
  'peach',
  'sky',
  'sapphire',
  'green',
  'rosewater',
] as const;

export const createCalendarEventSchema = object({
  name: pipe(string()),
  date: pipe(dateTime()),
  duration: union([
    pipe(
      string(),
      transform((v) => Number(v)),
      number(),
      minValue(15),
      maxValue(120)
    ),
    pipe(number(), minValue(15), maxValue(120)),
  ]),
  color: fallback(pipe(string(), picklist(Colors)), 'mauve'),
  description: optional(pipe(string())),
});

export const updateCalendarEventSchema = object({
  ...createCalendarEventSchema.entries,
  id: pipe(
    string(),
    custom((value) => {
      return isUuidV4(value as string);
    })
  ),
});

export const getCalendarEvents = object({
  startDate: optional(dateTime()),
  endDate: optional(dateTime()),
});

export interface CalendarEventTable {
  id: string;
  name: string;
  date: Date | string;
  duration: number;
  color: (typeof Colors)[number];
  deleted_at?: Date;
  description?: string;
}

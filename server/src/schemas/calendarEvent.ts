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
  dateUnix: pipe(number(), minValue(0)),
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
  startDate: optional(
    pipe(
      string(),
      transform((v: string) => parseInt(v)),
      number()
    )
  ),
  endDate: optional(
    pipe(
      string(),
      transform((v: string) => parseInt(v)),
      number()
    )
  ),
});

export interface CalendarEventTable {
  id: string;
  name: string;
  date: Date | string; // Deprecated due to ultra confusion in date management
  date_unix: number;
  duration: number;
  color: (typeof Colors)[number];
  deleted_at?: Date;
  description?: string;
}

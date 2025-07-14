import {
  custom,
  date,
  isoDateTime, isoTimestamp,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  pipe,
  string,
  transform,
  union,
} from 'valibot';
import { validate, version } from 'uuid';
import { stripDate } from './helper';

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
  duration: pipe(number(), minValue(15), maxValue(120)),
  color: pipe(string(), transform((value) => (value as Colors))),
});

export const getCalendarEvents = object({
  startDate: optional(union([
    pipe(
      string(),
      stripDate(),
      isoTimestamp(),
      transform((input) => new Date(input)),
    ),
    date(),
  ])),

  endDate: optional(union([
    pipe(
      string(),
      stripDate(),
      isoTimestamp(),
      transform((input) => new Date(input)),
    ),
    date(),
  ])),
});

export interface CalendarEventTable {
  id: string;
  name: string;
  date: Date;
  duration: number;
  color: Colors;
}

type Colors = 'mauve' | 'teal' | 'flamingo' | 'peach' | 'sky' | 'sapphire' | 'green' | 'rosewater'

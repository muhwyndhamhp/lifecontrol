import {
  date,
  isoDateTime,
  isoTimestamp,
  pipe,
  string,
  transform,
  union,
} from 'valibot';

export function stripDate() {
  return transform((input: string): string => {
    if (input.length >= 2 && input.startsWith('"') && input.endsWith('"')) {
      return input.slice(1, -1);
    }
    return input;
  });
}

export function dateTime() {
  return union([
    pipe(
      string('should be a string'),
      stripDate(),
      isoTimestamp('not valid iso timestamp format'),
      transform((input) => new Date(input))
    ),
    pipe(
      string('should be a string'),
      stripDate(),
      isoDateTime('not valid datetime format'),
      transform((input) => new Date(input))
    ),
    date(),
  ]);
}

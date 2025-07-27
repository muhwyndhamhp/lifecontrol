import {
  array,
  boolean,
  email,
  fallback,
  hexColor,
  InferOutput,
  isoDate,
  isoDateTime,
  literal,
  nonEmpty,
  object,
  optional,
  picklist,
  pipe,
  string,
  union,
} from 'valibot';

export const GoogleCalendarListEntry = object({
  id: pipe(string(), nonEmpty()),
  accessRole: pipe(string(), picklist(['writer', 'owner'])),
  backgroundColor: pipe(string(), hexColor()),
  summary: pipe(string(), nonEmpty()),
  summaryOverride: optional(string()),
});

export const BaseGoogleCalendarList = object({
  kind: pipe(string(), literal('calendar#calendarList')),
  etag: string(),
  items: array(GoogleCalendarListEntry),
});

export const NextPageGoogleCalendarList = object({
  ...BaseGoogleCalendarList.entries,
  __typename: fallback(literal('nextPage'), 'nextPage'),
  nextPageToken: string(),
});

export const NextSyncGoogleCalendarList = object({
  ...BaseGoogleCalendarList.entries,
  __typename: fallback(literal('nextSync'), 'nextSync'),
  nextSyncToken: string(),
});

export const GoogleCalendarList = union([
  NextPageGoogleCalendarList,
  NextSyncGoogleCalendarList,
]);

export const GoogleCalendarDateTime = object({
  dateTime: pipe(string(), isoDateTime()),
  date: pipe(string(), isoDate()),
  timeZome: pipe(string()),
});

export const GoogleCalendarAttendee = object({
  email: optional(pipe(string(), email())),
  displayName: optional(string()),
  responseStatus: picklist([
    'needsAction',
    'declined',
    'tentative',
    'accepted',
  ]),
});

export const GoogleCalendarOrganizer = object({
  email: optional(pipe(string(), email())),
  displayName: optional(string()),
  self: boolean(),
});

export const GoogleCalendarEvent = object({
  id: pipe(string(), nonEmpty()),
  summary: pipe(string(), nonEmpty()),
  description: optional(pipe(string(), nonEmpty())),
  start: GoogleCalendarDateTime,
  end: GoogleCalendarDateTime,
  attendees: array(GoogleCalendarAttendee),
  organizer: GoogleCalendarOrganizer,
  status: picklist(['confirmed', 'tentative', 'cancelled']),
});

export const NextPageGoogleCalendarEvent = object({
  __typename: fallback(literal('nextPage'), 'nextPage'),
  items: array(GoogleCalendarEvent),
  nextPageToken: string(),
});

export const NextSyncGoogleCalendarEvent = object({
  __typename: fallback(literal('nextSync'), 'nextSync'),
  items: array(GoogleCalendarEvent),
  nextSyncToken: string(),
});

export const GoogleCalendarEventList = union([
  NextPageGoogleCalendarList,
  NextSyncGoogleCalendarList,
]);

export type GoogleCalendars = InferOutput<typeof GoogleCalendarList>;
export type GoogleEvents = InferOutput<typeof GoogleCalendarEventList>;

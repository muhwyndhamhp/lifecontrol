import { Oauth2Token } from '@openauthjs/openauth/provider/oauth2';
import { GoogleCalendarEventList, GoogleEvents } from './types';
import { safeParse } from 'valibot';
import { calendarFetch, GoogleApiError } from './common';

export async function syncCalendarEvents(
  token: Oauth2Token,
  calendarId: string = 'primary',
  syncToken?: string,
  pageToken?: string
): Promise<GoogleEvents | Error[]> {
  if (!token.access) {
    throw new Error('Access token is missing');
  }

  const params = new URLSearchParams();
  if (syncToken) {
    params.append('syncToken', syncToken);
  }

  if (pageToken) {
    params.append('pagetoken', pageToken);
  }

  const response = await calendarFetch(
    token,
    `calendars/${calendarId}/events?${params.toString()}`
  );

  if (!(response instanceof Response)) {
    return response;
  }

  if (!response.ok) {
    const errorData: GoogleApiError = await response.json();
    return [
      new Error(
        `Google Calendar API error: ${response.status} ${response.statusText
        } - ${JSON.stringify(errorData)}`
      ),
    ];
  }

  const data = safeParse(GoogleCalendarEventList, await response.json());

  if (!data.success) {
    return data.issues.map((v) => new Error(v.message));
  }

  return data.output;
}

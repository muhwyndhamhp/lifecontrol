import { Oauth2Token } from '@openauthjs/openauth/provider/oauth2';
import { GoogleCalendarList, GoogleCalendars } from './types';
import { calendarFetch, GoogleApiError } from './common';
import { safeParse } from 'valibot';

export async function getCalendarList(
  token: Oauth2Token,
  syncToken?: string,
  pageToken?: string
): Promise<GoogleCalendars | Error[]> {
  const params = new URLSearchParams();
  if (syncToken) params.append('syncToken', syncToken);

  if (pageToken) params.append('pageToken', pageToken);

  const response = await calendarFetch(
    token,
    `users/me/calendarList?${params.toString()}`
  );

  if (!(response instanceof Response)) {
    console.log('Error non Respose');
    return response;
  }

  if (!response.ok) {
    console.log('NOT OK');
    const data = await response.text();
    console.log(`Error: ${data}`);
    const errorData: GoogleApiError = JSON.parse(data);
    return [
      new Error(
        `Google Calendar API error: ${response.status} 
        ${response.statusText} - ${JSON.stringify(errorData)}`
      ),
    ];
  }

  const jsonData = await response.json();
  const data = safeParse(GoogleCalendarList, jsonData);

  if (!data.success) {
    console.log(`
      Not Success to Parse, 
      issues: ${JSON.stringify(data.issues, null, 2)}
      `);

    return data.issues.map((v) => new Error(v.message));
  }

  return data.output;
}

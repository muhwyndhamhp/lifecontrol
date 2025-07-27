import { Oauth2Token } from '@openauthjs/openauth/provider/oauth2';

const GOOGLE_CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3';

export class SyncTokenExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyncTokenExpiredError';
  }
}

export interface GoogleApiError {
  error: {
    code: number;
    message: string;
    errors: {
      message: string;
      domain: string;
      reason: string;
    }[];
  };
}

export async function calendarFetch(
  token: Oauth2Token,
  pathAndQuery: string
): Promise<Response | Error[]> {
  const url = `${GOOGLE_CALENDAR_API_URL}${pathAndQuery}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token.access}`,
    },
  });

  if (response.status === 410) {
    return [
      new SyncTokenExpiredError(
        'Sync token is invalid. A full sync is required.'
      ),
    ];
  }

  return response;
}

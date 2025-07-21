export function getTokens(): {
  access: string | null;
  refresh: string | null;
  authenticated: boolean;
} {
  const cookies = parseCookies();
  const authenticated =
    !!cookies['access_token'] && cookies['access_token'].trim().length > 0;

  return {
    access: cookies['access_token'] || null,
    refresh: cookies['refresh_token'] || null,
    authenticated: authenticated,
  };
}

export async function setTokens(access: string, refresh: string) {
  setCookie('access_token', access);
  setCookie('refresh_token', refresh);
}

function parseCookies(): Record<string, string> {
  return document.cookie
    .split('; ')
    .map((cookie) => cookie.split('='))
    .reduce(
      (acc, [key, value]) => {
        if (key && value) {
          acc[decodeURIComponent(key)] = decodeURIComponent(value);
        }
        return acc;
      },
      {} as Record<string, string>
    );
}

function setCookie(
  name: string,
  value: string,
  options?: {
    maxAgeSeconds?: number;
    path?: string;
    sameSite?: 'Lax' | 'Strict' | 'None';
  }
): void {
  const {
    maxAgeSeconds = 34560000,
    path = '/',
    sameSite = 'Lax',
  } = options || {};

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; path=${path}; max-age=${maxAgeSeconds}; SameSite=${sameSite}`;
}


import { createMiddleware } from 'hono/factory';
import { getCookie, setCookie } from 'hono/cookie';
import { authClient, subjects } from '../../../auth/client';
import { Resource } from 'sst';
import { UserFromToken } from './types';
import { Env, getSqlFromContext, unwrap } from '../env';

export const authMiddleware = createMiddleware<
  { Bindings: Env } & {
    Variables: {
      user: UserFromToken;
    };
  }
>(async (c, next) => {
  const accessToken = getCookie(c, 'access_token')?.trim();
  const refreshToken = getCookie(c, 'refresh_token')?.trim();
  const sql = getSqlFromContext(c);

  if (!accessToken && !refreshToken) {
    return c.redirect('/authorize');
  }

  const existingSubject = await unwrap(sql.getVerified(accessToken ?? ''));

  if (existingSubject.user) {
    console.log(`***Existing User: ${JSON.stringify(existingSubject)}`);

    c.set('user', existingSubject.user);

    await next();
  } else {
    const cl = authClient(Resource.IssuerUrl.value);
    const verified = await cl.verify(subjects, accessToken ?? '', {
      refresh: refreshToken ?? '',
    });

    if (verified.err) {
      console.log('Error During Verifying: ', verified.err.message);

      return c.redirect('/authorize');
    }

    if (verified.tokens?.access && accessToken !== verified.tokens?.access) {
      sql.cacheVerified(
        verified.tokens?.access ?? '',
        verified.tokens?.refresh,
        verified.subject
      );

      setCookie(c, 'access_token', verified.tokens?.access ?? '');
      setCookie(c, 'refresh_token', verified.tokens?.refresh ?? '');
    } else {
      sql.cacheVerified(
        accessToken ?? '',
        refreshToken ?? '',
        verified.subject
      );
    }

    c.set('user', verified.subject);

    await next();
  }
});

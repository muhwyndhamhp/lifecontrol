import { Hono } from 'hono';
import { UserFromToken } from '../middlewares/types';
import { Env } from '../env';
import { getSecret } from '../calendar/google/secret';
import { getCalendarList } from '../calendar/google/calendarList';
import { GoogleCalendars } from '../calendar/google/types';

const calendars = new Hono<
  { Bindings: Env } & {
    Variables: {
      user: UserFromToken;
    };
  }
>().get('/', async (c) => {
  const user = c.get('user');
  const userId = parseInt(user.properties.userID);

  const secret = await getSecret(c.env, userId.toString(), 'google');
  if (!secret) {
    return c.json({
      success: false,
      errors: [new Error()],
      calendars: undefined as GoogleCalendars | undefined,
    });
  }

  const calendars = await getCalendarList(secret);
  if (Array.isArray(calendars)) {
    return c.json({ success: false, errors: calendars, calendars: undefined as GoogleCalendars | undefined });
  }

  return c.json({ success: true, calendars: calendars, errors: [] });
});

export default calendars;

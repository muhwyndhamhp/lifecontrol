import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import {
  createCalendarEventSchema,
  getCalendarEvents,
  updateCalendarEventSchema,
} from '../schemas/calendarEvent';
import { getSqlFromContext, unwrap } from '../env';
import { Env } from '../env';
import { UserFromToken } from '../middlewares/types';

const events = new Hono<
  { Bindings: Env } & {
    Variables: {
      user: UserFromToken;
    };
  }
>()
  .get('/', vValidator('query', getCalendarEvents), async (c) => {
    const sql = getSqlFromContext(c);
    const user = c.get('user');

    const userId = parseInt(user.properties.userID);

    const data = c.req.valid('query');
    const res = await unwrap(
      sql.getCalendarEvents(userId, data.startDate, data.endDate)
    );

    return c.json(res);
  })
  .post('/create', vValidator('json', createCalendarEventSchema), async (c) => {
    const sql = getSqlFromContext(c);
    const user = c.get('user');

    const data = c.req.valid('json');
    data.userId = parseInt(user.properties.userID);

    const res = await unwrap(sql.createCalendarEvents(data));

    return c.json(res);
  })
  .post('/update', vValidator('json', updateCalendarEventSchema), async (c) => {
    const sql = getSqlFromContext(c);
    const user = c.get('user');

    const data = c.req.valid('json');
    data.userId = parseInt(user.properties.userID);

    const res = await unwrap(sql.updateCalendarEvents(data));

    return c.json(res);
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id');
    const sql = getSqlFromContext(c);
    const user = c.get('user');

    const res = await unwrap(
      sql.deleteCalendarEvent(parseInt(user.properties.userID ?? ''), id)
    );

    return c.json(res);
  });

export default events;

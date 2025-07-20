import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import {
  createCalendarEventSchema,
  getCalendarEvents,
  updateCalendarEventSchema,
} from '../schemas/calendarEvent';
import { getSqlFromContext, unwrap } from '../env';
import { Env } from '../env';

const events = new Hono<{ Bindings: Env }>()
  .get('/', vValidator('query', getCalendarEvents), async (c) => {
    const sql = getSqlFromContext(c);
    const data = c.req.valid('query');
    const res = await unwrap(
      sql.getCalendarEvents(data.startDate, data.endDate)
    );
    return c.json(res);
  })
  .post('/create', vValidator('json', createCalendarEventSchema), async (c) => {
    const sql = getSqlFromContext(c);
    const data = c.req.valid('json');
    const res = await unwrap(sql.createCalendarEvents(data));
    return c.json(res);
  })
  .post('/update', vValidator('json', updateCalendarEventSchema), async (c) => {
    const sql = getSqlFromContext(c);
    const data = c.req.valid('json');
    const res = await unwrap(sql.updateCalendarEvents(data));
    return c.json(res);
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id');
    const sql = getSqlFromContext(c);
    const res = await unwrap(sql.deleteCalendarEvent(id));
    return c.json(res);
  });

export default events;

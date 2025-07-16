import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, getSqlFromContext, unwrap } from './env';
import { vValidator } from '@hono/valibot-validator';
import {
  createCalendarEventSchema,
  getCalendarEvents,
  updateCalendarEventSchema,
} from './schemas/calendarEvent';
import { handleAssets } from './assets';

const apiApp = new Hono<{ Bindings: Env }>()
  .get('/events', vValidator('query', getCalendarEvents), async (c) => {
    const sql = getSqlFromContext(c);
    const data = c.req.valid('query');

    const res = await unwrap(
      sql.getCalendarEvents(data.startDate, data.endDate)
    );
    return c.json(res);
  })
  .post(
    '/events/create',
    vValidator('json', createCalendarEventSchema),
    async (c) => {
      const sql = getSqlFromContext(c);
      const data = c.req.valid('json');

      const res = await unwrap(sql.createCalendarEvents(data));
      return c.json(res);
    }
  )
  .post(
    '/events/update',
    vValidator('json', updateCalendarEventSchema),
    async (c) => {
      const sql = getSqlFromContext(c);
      const data = c.req.valid('json');

      const res = await unwrap(sql.updateCalendarEvents(data));
      return c.json(res);
    }
  )
  .post('/events/delete', async (c) => {
    const id = c.req.query('id') ?? '';

    if (id.trim() === '') {
      return c.json({
        success: false,
        id: id,
      });
    }

    const sql = getSqlFromContext(c);
    const res = await unwrap(sql.deleteCalendarEvent(id));
    return c.json(res);
  });

const app = new Hono<{ Bindings: Env }>()
  .use(
    '*',
    cors({
      origin: ['http://localhost:5173'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })
  )
  .route('/api', apiApp)
  .get('*', handleAssets);

export default app;

export type AppType = typeof app;
export { SqlServer } from './env';

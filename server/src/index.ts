import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './env';
import { vValidator } from '@hono/valibot-validator';
import { createCalendarEventSchema } from './schemas/calendarEvent';

const apiApp = new Hono<{ Bindings: Env }>()
  .get('/events', async (c) => {
    const sql = getSqlFromContext(c);
    return c.json(await sql.getCalendarEvents());
  })
  .post('/events', vValidator('json', createCalendarEventSchema), async (c) => {
    const sql = getSqlFromContext(c);
    const data = c.req.valid('json');

    return c.json(await sql.createCalendarEvents(data));
  });

const app = new Hono<{ Bindings: Env }>()
  .use(
    '*',
    cors({
      origin: ['http://localhost:5173'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  )
  .route('/api', apiApp)
  .get('*', async (c) => {
    try {
      const assetResponse = await c.env.ASSETS.fetch(c.req.url);

      if (assetResponse.status !== 404) {
        return assetResponse;
      }

      const indexResponse = await c.env.ASSETS.fetch(new URL('/', c.req.url));
      return c.html(await indexResponse.text());
    } catch (error) {
      const indexResponse = await c.env.ASSETS.fetch(new URL('/', c.req.url));
      return c.html(await indexResponse.text());
    }
  });

export default app;

export type AppType = typeof app;

export { SqlServer } from './env';

function getSqlFromContext(c: Context<{ Bindings: Env }>) {
  const id = c.env.SQL_SERVER.idFromName('default');
  return c.env.SQL_SERVER.get(id);
}

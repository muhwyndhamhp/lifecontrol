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
import { object, string } from 'valibot';
import { OperationFromPrompt } from './llm/client';

const prompt = object({ prompt: string() });
const apiApp = new Hono<{ Bindings: Env }>()
  .delete('/events/:id', async (c) => {
    const id = c.req.param('id');
    const sql = getSqlFromContext(c);
    const res = await unwrap(sql.deleteCalendarEvent(id));
    return c.json(res);
  })
  .post('/prompt', vValidator('json', prompt), async (c) => {
    const data = c.req.valid('json');
    const sql = getSqlFromContext(c);
    console.log('*** Request coming in...');

    const llmRes = await OperationFromPrompt(data.prompt);

    if (!llmRes.success) {
      return c.json({
        promptResponse:
          'error during understanding your request, please try again',
      });
    }

    console.log('*** LLM Response', JSON.stringify(llmRes, null, 2));

    const res = llmRes.response.operation;

    switch (res.__typename) {
      case 'Query': {
        const r = await unwrap(sql.queryByPrompts(res));
        return c.json({ ...r, promptResponse: llmRes.response.response });
      }
      case 'Create': {
        const r = await unwrap(sql.createByPrompts(res));
        return c.json({ ...r, promptResponse: llmRes.response.response });
      }
      case 'Update': {
        const r = await unwrap(sql.updateByPrompts(res));
        return c.json({ ...r, promptResponse: llmRes.response.response });
      }
      case 'None': {
        return c.json({ promptResponse: llmRes.response.response });
      }
    }
  })
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
  );

const app = new Hono<{ Bindings: Env }>()
  .use(
    '*',
    cors({
      origin: [
        'http://localhost:5173',
        'https://lifecontrol.mwyndham.dev',
        'https://hackathon-lifecontrol.mwyndham.dev',
      ],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })
  )
  .route('/api', apiApp)
  .get('*', handleAssets);

export default app;

export type AppType = typeof app;
export { SqlServer } from './env';

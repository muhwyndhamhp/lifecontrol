import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './env';
import { handleAssets } from './assets';
import events from './routes/events';
import prompt from './routes/prompt';
import { authMiddleware } from './middlewares/auth';
import calendars from './routes/calendar';

const apiApp = new Hono<{ Bindings: Env }>()
  .route('/events', events)
  .route('/prompt', prompt)
  .route('/calendars', calendars);

const app = new Hono<{ Bindings: Env }>()
  .use(
    '*',
    cors({
      origin: ['http://localhost:5173', 'https://lifecontrol.mwyndham.dev'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })
  )
  .use('/api/*', authMiddleware)
  .route('/api', apiApp)
  .get('*', handleAssets);

export default app;

export type AppType = typeof app;
export { SqlServer } from './queries/durableObject';

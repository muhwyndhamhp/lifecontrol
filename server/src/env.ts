import { DurableObject } from 'cloudflare:workers';
import { Kysely } from 'kysely';
import { DODialect } from 'kysely-do';
import { migrate } from './migration';
import { createEvents, getCalendarEvents } from './queries/calendarEvents';
import { Database } from './schemas/database';
import { InferOutput } from 'valibot';
import { createCalendarEventSchema } from './schemas/calendarEvent';
import { Context } from 'hono';

export interface Env {
  ASSETS: Fetcher;
  SQL_SERVER: DurableObjectNamespace<SqlServer>;
}

export class SqlServer extends DurableObject<Env> {
  db: Kysely<Database>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    migrate(this.ctx.storage.sql);

    this.db = new Kysely<Database>({
      dialect: new DODialect({ ctx }),
    });
  }

  async getCalendarEvents(dateStart?: Date, dateEnd?: Date) {
    return await getCalendarEvents(this.db, dateStart, dateEnd);
  }

  async createCalendarEvents(
    input: InferOutput<typeof createCalendarEventSchema>,
  ) {
    return await createEvents(this.db, input);
  }
}

export function getSqlFromContext(c: Context<{ Bindings: Env }>) {
  const id = c.env.SQL_SERVER.idFromName('default');
  return c.env.SQL_SERVER.get(id);
}

export async function unwrap<T>(promise: Promise<T & Disposable>): Promise<T> {
  const value = await promise;
  try {
    if (Array.isArray(value)) {
      return [...value] as T;
    }
    return value;
  } finally {
    if (typeof value[Symbol.dispose] === 'function') {
      value[Symbol.dispose]();
    }
  }
}


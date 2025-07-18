import { DurableObject } from 'cloudflare:workers';
import { Kysely, LogEvent } from 'kysely';
import { DODialect } from 'kysely-do';
import { migrate } from './migration';
import {
  createByPrompts,
  createEvents,
  deleteEvent,
  getCalendarEvents,
  queryByPrompts,
  updateByPrompts,
  updateEvents,
} from './queries/calendarEvents';
import { Database } from './schemas/database';
import { InferOutput } from 'valibot';
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
} from './schemas/calendarEvent';
import { Context } from 'hono';
import {
  internalCreateSchema,
  internalQuerySchema,
  internalUpdateSchema,
} from './llm/types';

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
      log(event: LogEvent) {
        if (event.level === 'query') {
          console.log('--- Kysely Query ---');
          console.log('SQL:', event.query.sql);
          console.log('Parameters:', event.query.parameters);
          console.log('Duration (ms):', event.queryDurationMillis);
          console.log('--------------------');
        } else if (event.level === 'error') {
          console.error('--- Kysely Error ---');
          console.error('SQL:', event.query.sql);
          console.error('Parameters:', event.query.parameters);
          console.error('Error:', event.error);
          console.error('Duration (ms):', event.queryDurationMillis);
          console.error('--------------------');
        }
      },
    });
  }

  async getCalendarEvents(dateStart?: Date, dateEnd?: Date) {
    return await getCalendarEvents(this.db, dateStart, dateEnd);
  }

  async createCalendarEvents(
    input: InferOutput<typeof createCalendarEventSchema>
  ) {
    return await createEvents(this.db, input);
  }

  async updateCalendarEvents(
    input: InferOutput<typeof updateCalendarEventSchema>
  ) {
    return await updateEvents(this.db, input);
  }

  async deleteCalendarEvent(id: string) {
    return await deleteEvent(this.db, id);
  }

  async queryByPrompts(query: InferOutput<typeof internalQuerySchema>) {
    return await queryByPrompts(this.db, query);
  }

  async createByPrompts(query: InferOutput<typeof internalCreateSchema>) {
    return await createByPrompts(this.db, query);
  }

  async updateByPrompts(query: InferOutput<typeof internalUpdateSchema>) {
    return await updateByPrompts(this.db, query);
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

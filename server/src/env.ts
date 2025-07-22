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
import { Database, ValidationCache } from './schemas/database';
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
import { ContextfulUserFromToken, UserFromToken } from './middlewares/types';

export interface Env {
  ASSETS: Fetcher;
  SQL_SERVER: DurableObjectNamespace<SqlServer>;
  ISSUER_URL: SecretsStoreSecret;
  CEREBRAS_SECRET: SecretsStoreSecret;
}

export class SqlServer extends DurableObject<Env> {
  db: Kysely<Database>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    migrate(this.ctx.storage.sql);

    this.ctx.storage.sql.exec<ValidationCache>(
      `
      delete 
        from "validation_cache" 
      where 
        expiry_timestamp <= ${new Date().getTime() / 1000}`
    );

    this.db = new Kysely<Database>({
      dialect: new DODialect({ ctx }),
      log(event: LogEvent) {
        const { sql, parameters } = event.query;
        const duration = event.queryDurationMillis;

        if (event.level === 'query') {
          console.log('--- Kysely Query ---');
          console.log(`SQL: ${sql}`);
          console.log(`Parameters: ${JSON.stringify(parameters)}`);
          console.log(`Duration (ms): ${duration}`);
          console.log('--------------------');
        } else if (event.level === 'error') {
          console.error('--- Kysely Error ---');
          console.error(`SQL: ${sql}`);
          console.error(`Parameters: ${JSON.stringify(parameters)}`);
          console.error(`Error: ${event.error}`);
          console.error(`Duration (ms): ${duration}`);
          console.error('--------------------');
        }
      },
    });
  }

  async getCalendarEvents(
    userId: number,
    dateStart?: number,
    dateEnd?: number
  ) {
    return await getCalendarEvents(this.db, userId, dateStart, dateEnd);
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

  async deleteCalendarEvent(userId: number, id: string) {
    return await deleteEvent(this.db, userId, id);
  }

  async queryByPrompts(
    userId: number,
    query: InferOutput<typeof internalQuerySchema>
  ) {
    return await queryByPrompts(this.db, userId, query);
  }

  async createByPrompts(
    userId: number,
    query: InferOutput<typeof internalCreateSchema>,
    offsetHour: number
  ) {
    return await createByPrompts(this.db, userId, query, offsetHour);
  }

  async updateByPrompts(
    userId: number,
    query: InferOutput<typeof internalUpdateSchema>,
    offsetHour: number
  ) {
    return await updateByPrompts(this.db, userId, query, offsetHour);
  }

  async cacheVerified(access: string, refresh: string, user: UserFromToken) {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 2);

    this.ctx.storage.sql.exec(
      `insert into "validation_cache" 
      (access, refresh, user_id, oauth_id, email, expiry_timestamp) 
      values(
        "${access}", 
        "${refresh}", 
        ${parseInt(user.properties.userID)}, 
        "${user.properties.oauthID}", 
        "${user.properties.email}", 
        ${expiryDate.getTime() / 1000}
      )`
    );

    await this.ctx.storage.setAlarm(expiryDate);
  }

  async alarm() {
    this.ctx.storage.sql.exec<ValidationCache>(
      `delete from "validation_cache" where expiry_timestamp <= ${new Date().getTime() / 1000}`
    );
  }

  async getVerified(access: string) {
    const res = this.ctx.storage.sql
      .exec<ValidationCache>(
        `select * from "validation_cache" where access = "${access}" limit 1`
      )
      .toArray();

    if (!res || res.length === 0) {
      return {
        access: '',
        refresh: '',
      } as ContextfulUserFromToken;
    }

    return {
      access: res[0].access,
      refresh: res[0].refresh,
      user: {
        type: 'user',
        properties: {
          userID: res[0].user_id.toString(),
          oauthID: res[0].oauth_id,
          email: res[0].email,
        },
      },
    } as ContextfulUserFromToken;
  }
}

export function getSqlFromContext(
  c: Context<
    { Bindings: Env } & {
      Variables: {
        user: UserFromToken;
      };
    }
  >
) {
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

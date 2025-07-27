import { Kysely, LogEvent } from "kysely";
import { Database } from "../schemas/database";
import { migrate } from "../migration";
import { DurableObject } from "cloudflare:workers";
import { CacheVerified, GetVerified, RemoveCache } from "./sessionCache";
import { DODialect } from "kysely-do";
import { CreateEvents, CreateEventsParam, DeleteEvent, DeleteEventParams, GetCalendarEvents, GetCalendarEventsParam, UpdateEvents, UpdateEventsParam } from "./calendarEvents";
import { BulkCreateByPrompts, BulkCreateByPromptsParam, CreateByPrompts, CreateByPromptsParam, QueryByPrompts, QueryByPromptsParam, UpdateByPrompts, UpdateByPromptsParam } from "./promptCalendar";
import { UserFromToken } from "../middlewares/types";
import { Context } from "hono";
import { Env } from "../env";

export class SqlServer extends DurableObject<Env> {
  db: Kysely<Database>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    migrate(this.ctx.storage.sql);
    RemoveCache(this.ctx.storage);

    this.db = new Kysely<Database>({
      dialect: new DODialect({ ctx }),
      log(event: LogEvent) {
        const { sql, parameters } = event.query;
        const duration = event.queryDurationMillis;

        if (event.level === 'error') {
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

  async getCalendarEvents(props: GetCalendarEventsParam) {
    return await GetCalendarEvents({ ...props, db: this.db });
  }
  async createCalendarEvents(props: CreateEventsParam) {
    return await CreateEvents({ ...props, db: this.db });
  }
  async updateCalendarEvents(props: UpdateEventsParam) {
    return await UpdateEvents({ ...props, db: this.db });
  }
  async deleteCalendarEvent(props: DeleteEventParams) {
    return await DeleteEvent({ ...props, db: this.db });
  }
  async queryByPrompts(props: QueryByPromptsParam) {
    return await QueryByPrompts({ ...props, db: this.db });
  }
  async bulkCreateByPrompts(props: BulkCreateByPromptsParam) {
    return await BulkCreateByPrompts({ ...props, db: this.db });
  }
  async createByPrompts(props: CreateByPromptsParam) {
    return await CreateByPrompts({ ...props, db: this.db });
  }
  async updateByPrompts(props: UpdateByPromptsParam) {
    return await UpdateByPrompts({ ...props, db: this.db });
  }
  async cacheVerified(access: string, refresh: string, user: UserFromToken) {
    return await CacheVerified(this.ctx.storage, access, refresh, user);
  }
  async getVerified(access: string) {
    return await GetVerified(this.ctx.storage, access);
  }

  async alarm() {
    return RemoveCache(this.ctx.storage);
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

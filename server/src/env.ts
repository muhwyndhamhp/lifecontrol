import { DurableObject } from 'cloudflare:workers';
import { Kysely } from 'kysely';
import { DODialect } from 'kysely-do';
import { migrate } from './migration';
import { createEvents, getCalendarEvents } from './queries/calendarEvents';
import { Database } from './schemas/database';
import { InferOutput } from 'valibot';
import { createCalendarEventSchema } from './schemas/calendarEvent';

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

  async getCalendarEvents() {
    return await getCalendarEvents(this.db);
  }

  async createCalendarEvents(
    input: InferOutput<typeof createCalendarEventSchema>,
  ) {
    return await createEvents(this.db, input);
  }
}

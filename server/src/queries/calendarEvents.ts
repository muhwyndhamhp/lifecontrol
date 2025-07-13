import { Kysely } from 'kysely';
import { Database } from '../schemas/database';
import { InferOutput } from 'valibot';
import { createCalendarEventSchema } from '../schemas/calendarEvent';
import { v4 } from 'uuid';

export async function getCalendarEvents(db: Kysely<Database>) {
  return await db.selectFrom('calendar_events').selectAll().execute();
}

export async function createEvents(
  db: Kysely<Database>,
  input: InferOutput<typeof createCalendarEventSchema>,
) {
  const id = v4();

  const result = await db
    .insertInto('calendar_events')
    .values({
      id,
      name: input.name,
      date: input.date,
    })
    .executeTakeFirst();

  return {
    success: !!(result.numInsertedOrUpdatedRows ?? 0n > 0n),
    id: id,
  };
}

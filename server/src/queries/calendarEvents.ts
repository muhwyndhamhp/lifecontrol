import { Kysely } from 'kysely';
import { Database } from '../schemas/database';
import { InferOutput } from 'valibot';
import { createCalendarEventSchema } from '../schemas/calendarEvent';
import { v4 } from 'uuid';

export async function getCalendarEvents(db: Kysely<Database>, dateStart?: Date, dateEnd?: Date) {
  let q = db.selectFrom('calendar_events').selectAll();

  if (!!dateStart) q = q.where('calendar_events.date', '>', dateStart);
  if (!!dateEnd) q = q.where('calendar_events.date', '<', dateEnd);

  return await q.execute();
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
      duration: input.duration,
      color: input.color,
    })
    .executeTakeFirst();

  return {
    success: !!(result.numInsertedOrUpdatedRows ?? 0n > 0n),
    id: id,
  };
}

import { Kysely } from 'kysely';
import { Database } from '../schemas/database';
import { InferOutput } from 'valibot';
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
} from '../schemas/calendarEvent';
import { v4 } from 'uuid';

export async function getCalendarEvents(
  db: Kysely<Database>,
  dateStart?: Date,
  dateEnd?: Date
) {
  let q = db
    .selectFrom('calendar_events')
    .where('calendar_events.deleted_at', 'is', null)
    .selectAll();

  if (!!dateStart) q = q.where('calendar_events.date', '>', dateStart);
  if (!!dateEnd) q = q.where('calendar_events.date', '<', dateEnd);

  return await q.execute();
}

export async function createEvents(
  db: Kysely<Database>,
  input: InferOutput<typeof createCalendarEventSchema>
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
      description: input.description,
    })
    .executeTakeFirst();

  return {
    success: !!(result.numInsertedOrUpdatedRows ?? 0n > 0n),
    id: id,
  };
}

export async function updateEvents(
  db: Kysely<Database>,
  input: InferOutput<typeof updateCalendarEventSchema>
) {
  const result = await db
    .updateTable('calendar_events')
    .set({
      id: input.id,
      name: input.name,
      date: input.date,
      duration: input.duration,
      color: input.color,
      description: input.description,
    })
    .where('calendar_events.id', '=', input.id)
    .executeTakeFirst();

  return {
    success: !!(result.numUpdatedRows ?? 0n > 0n),
    id: input.id,
  };
}

export async function deleteEvent(db: Kysely<Database>, id: string) {
  const result = await db
    .deleteFrom('calendar_events')
    .where('calendar_events.id', '=', id)
    .executeTakeFirst();

  return {
    success: !!(result.numDeletedRows ?? 0n > 0n),
    id: id,
  };
}

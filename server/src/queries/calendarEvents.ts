import { Kysely } from 'kysely';
import { Database } from '../schemas/database';
import { InferOutput } from 'valibot';
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
} from '../schemas/calendarEvent';
import { v4 } from 'uuid';

export interface GetCalendarEventsParam {
  db?: Kysely<Database>;
  userId: number;
  dateStart?: number;
  dateEnd?: number;
}
export async function GetCalendarEvents({
  db,
  userId,
  dateStart,
  dateEnd,
}: GetCalendarEventsParam) {
  if (!db) throw new Error('db must not be undefined');

  let q = db
    .selectFrom('calendar_events')
    .where('calendar_events.deleted_at', 'is', null)
    .where('calendar_events.user_id', '=', userId)
    .selectAll();

  if (!!dateStart) q = q.where('calendar_events.date_unix', '>=', dateStart);
  if (!!dateEnd) q = q.where('calendar_events.date_unix', '<=', dateEnd);

  return await q.execute();
}

export interface CreateEventsParam {
  db?: Kysely<Database>;
  input: InferOutput<typeof createCalendarEventSchema>;
}
export async function CreateEvents({ db, input }: CreateEventsParam) {
  if (!db) throw new Error('db must not be undefined');

  const id = v4();
  const result = await db
    .insertInto('calendar_events')
    .values({
      id,
      name: input.name,
      date: input.date,
      date_unix: input.dateUnix,
      duration: input.duration,
      color: input.color,
      description: input.description,
      user_id: input.userId,
    })
    .executeTakeFirst();

  return {
    success: !!(result.numInsertedOrUpdatedRows ?? 0n > 0n),
    id: id,
  };
}

export interface UpdateEventsParam {
  db?: Kysely<Database>;
  input: InferOutput<typeof updateCalendarEventSchema>;
}

export async function UpdateEvents({ db, input }: UpdateEventsParam) {
  if (!db) throw new Error('db must not be undefined');

  const result = await db
    .updateTable('calendar_events')
    .set({
      id: input.id,
      name: input.name,
      date: input.date,
      date_unix: input.dateUnix,
      duration: input.duration,
      color: input.color,
      description: input.description,
      user_id: input.userId,
    })
    .where('calendar_events.id', '=', input.id)
    .where('calendar_events.user_id', '=', input.userId ?? 0)
    .executeTakeFirst();

  return {
    success: !!(result.numUpdatedRows ?? 0n > 0n),
    id: input.id,
  };
}

export interface DeleteEventParams {
  db?: Kysely<Database>;
  userId: number;
  id: string;
}

export async function DeleteEvent({ db, userId, id }: DeleteEventParams) {
  if (!db) throw new Error('db must not be undefined');

  const result = await db
    .deleteFrom('calendar_events')
    .where('calendar_events.id', '=', id)
    .where('calendar_events.user_id', '=', userId)
    .executeTakeFirst();

  return {
    success: !!(result.numDeletedRows ?? 0n > 0n),
    id: id,
  };
}

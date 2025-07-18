import { ComparisonOperatorExpression, Kysely, sql } from 'kysely';
import { Database } from '../schemas/database';
import { InferOutput } from 'valibot';
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
} from '../schemas/calendarEvent';
import { v4 } from 'uuid';
import {
  internalCreateSchema,
  internalQuerySchema,
  internalUpdateSchema,
} from '../llm/types';

export async function updateByPrompts(
  db: Kysely<Database>,
  update: InferOutput<typeof internalUpdateSchema>
) {
  let q = db.updateTable('calendar_events');

  update.set.forEach((v) => {
    q = q.set(sql`${v.column}`, sql`${v.value}`);
  });

  update.whereStatements.forEach((v) => {
    console.log('Where: ', v);
    q = q.where(
      sql`${v.column}`,
      v.control as ComparisonOperatorExpression,
      sql`${v.value}`
    );
  });

  const result = await q.execute();

  console.log('***Update By Propmt: ', result);

  return {
    success: !!(result.length ?? 0n > 0n),
  };
}

export async function createByPrompts(
  db: Kysely<Database>,
  create: InferOutput<typeof internalCreateSchema>
) {
  const result = await db
    .insertInto('calendar_events')
    .values({
      id: v4(),
      name: create.name,
      date: new Date(create.date),
      duration: create.duration,
      color: create.color,
      description: create.description,
    })
    .executeTakeFirst();

  console.log('***Create By Propmt: ', result);

  return {
    success: !!(result.numInsertedOrUpdatedRows ?? 0n > 0n),
    id: create.id,
  };
}

export async function queryByPrompts(
  db: Kysely<Database>,
  query: InferOutput<typeof internalQuerySchema>
) {
  let q = db.selectFrom('calendar_events').selectAll();
  query.whereStatements.forEach((v) => {
    q = q.where(sql`${v.column}`, sql`${v.control}`, sql`${v.value}`);
  });

  q = q.limit(query.paginate.limit).offset(query.paginate.offset);

  const result = await q.execute();

  console.log('***Query By Propmt: ', result);

  return result;
}

export async function getCalendarEvents(
  db: Kysely<Database>,
  dateStart?: Date,
  dateEnd?: Date
) {
  console.log('***Start Date: ', dateStart);
  console.log('***End Date: ', dateEnd);

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

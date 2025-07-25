import {
  ComparisonOperatorExpression,
  Kysely,
  OrderByDirection,
  sql,
} from 'kysely';
import { Database } from '../schemas/database';
import { InferOutput } from 'valibot';
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
} from '../schemas/calendarEvent';
import { v4 } from 'uuid';
import {
  internalBulkCreateSchema,
  internalCreateSchema,
  internalQuerySchema,
  internalUpdateSchema,
} from '../llm/types';

function applyWhereFromPrompts(
  db: Kysely<Database>,
  q: any,
  whereStatements: InferOutput<typeof internalQuerySchema>['whereStatements']
) {
  const { ref } = db.dynamic;

  whereStatements.forEach((v) => {
    const columnRef = ref(v.column);
    let query = sql`${columnRef}`;
    let value = sql`${v.value}`;

    const isLower =
      columnRef.dynamicReference === 'calendar_events.name' ||
      columnRef.dynamicReference === 'calendar_events.description';

    const isDate = columnRef.dynamicReference === 'calendar_events.date';

    if (isLower) {
      query = sql`lower(
      ${columnRef}
      )`;
    }

    if (isDate) {
      query = sql`${ref('calendar_events.date_unix')}`;
      value = sql`${new Date(v.value).getTime() / 1000}`;
    }

    q = q.where(query, v.control as ComparisonOperatorExpression, value);
  });

  return q;
}

export async function updateByPrompts(
  db: Kysely<Database>,
  userId: number,
  update: InferOutput<typeof internalUpdateSchema>,
  offsetHour: number
) {
  let q = db.updateTable('calendar_events');

  const { ref } = db.dynamic;

  update.set.forEach((v) => {
    if (ref(v.column).dynamicReference === 'user_id') {
      return;
    }

    if (ref(v.column).dynamicReference === 'date') {
      const date = new Date(v.value);
      date.setHours(date.getHours() + offsetHour);

      q = q
        .set(sql`date`, sql`${date}`)
        .set(sql`date_unix`, sql`${date.getTime() / 1000}`);
    } else {
      q = q.set(sql`${ref(v.column)}`, sql`${v.value}`);
    }
  });

  q = applyWhereFromPrompts(db, q, update.whereStatements);
  q = q.where('calendar_events.user_id', '=', userId);

  const result = await q.returningAll().execute();

  return {
    success: !!result,
    event: result,
  };
}

export async function bulkCreateByPrompts(
  db: Kysely<Database>,
  userId: number,
  create: InferOutput<typeof internalBulkCreateSchema>,
  offsetHour: number
) {
  const promises = create.operations.map(
    async (v) => await createByPrompts(db, userId, v, offsetHour)
  );

  const wrapperResult = await Promise.all(promises);
  let success = true;

  const result = wrapperResult.map((v) => {
    success = v.success;
    return v.event;
  });

  return {
    success: success,
    event: result,
  };
}

export async function createByPrompts(
  db: Kysely<Database>,
  userId: number,
  create: InferOutput<typeof internalCreateSchema>,
  offsetHour: number
) {
  const date = new Date(create.date);
  date.setHours(date.getHours() + offsetHour);

  const result = await db
    .insertInto('calendar_events')
    .values({
      id: v4(),
      name: create.name,
      date: date,
      date_unix: date.getTime() / 1000,
      duration: create.duration,
      color: create.color,
      description: create.description,
      user_id: userId,
    })
    .returningAll()
    .executeTakeFirst();

  return {
    success: !!result,
    event: result,
  };
}

export async function queryByPrompts(
  db: Kysely<Database>,
  userId: number,
  query: InferOutput<typeof internalQuerySchema>
) {
  const { ref } = db.dynamic;
  let q = db.selectFrom('calendar_events').selectAll();

  q = applyWhereFromPrompts(db, q, query.whereStatements);

  q = q.orderBy(
    sql`${ref(query.order.column)}`,
    query.order.direction as OrderByDirection
  );

  q = q.where('calendar_events.deleted_at', 'is', null);
  q = q.where('calendar_events.user_id', '=', userId);
  q = q.limit(query.paginate.limit).offset(query.paginate.offset);

  return await q.execute();
}

export async function getCalendarEvents(
  db: Kysely<Database>,
  userId: number,
  dateStart?: number,
  dateEnd?: number
) {
  let q = db
    .selectFrom('calendar_events')
    .where('calendar_events.deleted_at', 'is', null)
    .where('calendar_events.user_id', '=', userId)
    .selectAll();

  if (!!dateStart) q = q.where('calendar_events.date_unix', '>=', dateStart);
  if (!!dateEnd) q = q.where('calendar_events.date_unix', '<=', dateEnd);

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

export async function deleteEvent(
  db: Kysely<Database>,
  userId: number,
  id: string
) {
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

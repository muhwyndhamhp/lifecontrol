import {
  ComparisonOperatorExpression,
  Kysely,
  OrderByDirection,
  sql,
} from 'kysely';
import { Database } from '../schemas/database';
import { InferOutput } from 'valibot';
import {
  internalBulkCreateSchema,
  internalCreateSchema,
  internalQuerySchema,
  internalUpdateSchema,
} from '../llm/types';
import { v4 } from 'uuid';

export interface UpdateByPromptsParam {
  db?: Kysely<Database>;
  userId: number;
  update: InferOutput<typeof internalUpdateSchema>;
  offsetHour: number;
}

export async function UpdateByPrompts({
  db,
  userId,
  update,
  offsetHour,
}: UpdateByPromptsParam) {
  if (!db) throw Error('db must not be undefined');

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

export interface BulkCreateByPromptsParam {
  db?: Kysely<Database>;
  userId: number;
  create: InferOutput<typeof internalBulkCreateSchema>;
  offsetHour: number;
}
export async function BulkCreateByPrompts({
  db,
  userId,
  create,
  offsetHour,
}: BulkCreateByPromptsParam) {
  if (!db) throw new Error('db must not be undefined');

  const promises = create.operations.map(
    async (v) => await CreateByPrompts({ db, userId, create: v, offsetHour })
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

export interface CreateByPromptsParam {
  db?: Kysely<Database>;
  userId: number;
  create: InferOutput<typeof internalCreateSchema>;
  offsetHour: number;
}

export async function CreateByPrompts({
  db,
  userId,
  create,
  offsetHour,
}: CreateByPromptsParam) {
  if (!db) throw new Error('db must not be undefined');

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

export interface QueryByPromptsParam {
  db?: Kysely<Database>;
  userId: number;
  query: InferOutput<typeof internalQuerySchema>;
}

export async function QueryByPrompts({
  db,
  userId,
  query,
}: QueryByPromptsParam) {
  if (!db) throw new Error('db must not be undefined');

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

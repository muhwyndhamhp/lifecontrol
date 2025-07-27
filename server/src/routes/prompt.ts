import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import { InferOutput, number, object, string } from 'valibot';
import { OperationFromPrompt } from '../llm/client';
import {
  promptResponseBulkCreate,
  promptResponseCreate,
  promptResponseQuery,
  promptResponseUpdate,
  promptStructuredResponseSchema,
} from '../llm/types';
import { Env } from '../env';
import { UserFromToken } from '../middlewares/types';
import { getSqlFromContext, unwrap } from '@queries/durableObject';

const promptSchema = object({ prompt: string(), hourOffset: number() });

const prompt = new Hono<
  { Bindings: Env } & {
    Variables: {
      user: UserFromToken;
    };
  }
>().post('/', vValidator('json', promptSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');

  const userId = parseInt(user.properties.userID);
  if (userId <= 0) {
    throw Error('user is not recognized');
  }

  const sql = getSqlFromContext(c);

  const llmRes = await OperationFromPrompt(
    await c.env.CEREBRAS_SECRET.get(),
    userId,
    data.prompt,
    data.hourOffset
  );

  if (!llmRes.success) {
    return c.json({
      promptResponse:
        'error during understanding your request, please try again',
      result: { __typename: 'None' },
    } as InferOutput<typeof promptStructuredResponseSchema>);
  }

  const res = llmRes.response.operation;
  let result: InferOutput<typeof promptStructuredResponseSchema>['result'];

  switch (res.__typename) {
    case 'Query': {
      const r = await unwrap(sql.queryByPrompts({ userId, query: res }));
      result = {
        __typename: 'Query',
        events: r.map((v) => ({
          ...v,
        })),
      } as InferOutput<typeof promptResponseQuery>;
      break;
    }
    case 'Create': {
      const r = await unwrap(
        sql.createByPrompts({
          userId,
          create: res,
          offsetHour: data.hourOffset,
        })
      );
      result = {
        __typename: 'Create',
        events: [
          {
            ...r.event,
          },
        ],
      } as InferOutput<typeof promptResponseCreate>;
      break;
    }
    case 'Update': {
      const r = await unwrap(
        sql.updateByPrompts({
          userId,
          update: res,
          offsetHour: data.hourOffset,
        })
      );
      result = {
        __typename: 'Update',
        events: r.event.map((v) => ({
          ...v,
        })),
      } as InferOutput<typeof promptResponseUpdate>;
      break;
    }
    case 'BulkCreate': {
      const r = await unwrap(
        sql.bulkCreateByPrompts({
          userId,
          create: res,
          offsetHour: data.hourOffset,
        })
      );
      result = {
        __typename: 'BulkCreate',
        events: r.event.map((v) => ({
          ...v,
        })),
      } as InferOutput<typeof promptResponseBulkCreate>;
      break;
    }
    case 'None': {
      result = { __typename: 'None' };
      break;
    }
  }

  return c.json({
    promptResponse: llmRes.response.response,
    result,
  } as InferOutput<typeof promptStructuredResponseSchema>);
});

export default prompt;

import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import { InferOutput, number, object, string } from 'valibot';
import { OperationFromPrompt } from '../llm/client';
import {
  promptResponseCreate,
  promptResponseQuery,
  promptResponseUpdate,
  promptStructuredResponseSchema,
} from '../llm/types';
import { getSqlFromContext, unwrap } from '../env';
import { Env } from '../env';

const promptSchema = object({ prompt: string(), hourOffset: number() });

const prompt = new Hono<{ Bindings: Env }>().post(
  '/',
  vValidator('json', promptSchema),
  async (c) => {
    const data = c.req.valid('json');
    const sql = getSqlFromContext(c);
    const llmRes = await OperationFromPrompt(data.prompt, data.hourOffset);

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
        const r = await unwrap(sql.queryByPrompts(res));
        result = {
          __typename: 'Query',
          events: r.map((v) => ({
            ...v,
          })),
        } as InferOutput<typeof promptResponseQuery>;
        break;
      }
      case 'Create': {
        const r = await unwrap(sql.createByPrompts(res, data.hourOffset));
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
        const r = await unwrap(sql.updateByPrompts(res));
        result = {
          __typename: 'Update',
          events: r.event.map((v) => ({
            ...v,
          })),
        } as InferOutput<typeof promptResponseUpdate>;
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
  }
);

export default prompt;

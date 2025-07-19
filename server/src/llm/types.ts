import {
  array,
  custom,
  fallback,
  literal,
  number,
  object,
  optional,
  picklist,
  pipe,
  string,
  union,
} from 'valibot';
import { Colors } from '../schemas/calendarEvent';
import { toJsonSchema } from '@valibot/to-json-schema';
import { validate, version } from 'uuid';

export const Operations = ['Create', 'Update', 'Query', 'None'] as const;

export const updateSchema = object({
  __typename: picklist(Operations, 'Update'),
  set: array(
    object({
      column: string(),
      value: string(),
    })
  ),
  whereStatements: pipe(
    array(
      object({
        column: string(),
        control: string(),
        value: string(),
      })
    )
  ),
});

export const createSchema = object({
  __typename: picklist(Operations, 'Create'),
  id: pipe(
    string(),
    custom((value) => {
      return isUuidV4(value as string);
    })
  ),
  name: pipe(string()),
  date: string(),
  dateUnix: number(),
  duration: number(),
  color: fallback(pipe(string(), picklist(Colors)), 'mauve'),
  description: optional(pipe(string())),
});

export const queryEventSchema = object({
  __typename: picklist(Operations, 'Query'),
  whereStatements: pipe(
    array(
      object({
        column: string(),
        control: string(),
        value: string(),
      })
    )
  ),
  paginate: pipe(
    object({
      limit: pipe(number()),
      offset: pipe(number()),
    })
  ),
});

export const noneSchema = object({
  __typename: picklist(Operations, 'None'),
});

export const structuredEventSchema = object({
  operation: union([queryEventSchema, createSchema, updateSchema, noneSchema]),
  response: string(),
});

const StructuredEventJSON = toJsonSchema(structuredEventSchema, {
  typeMode: 'input',
  overrideSchema(context) {
    context.referenceId;
  },
});

export const { $schema, ...StructuredEventJSONSchema } = StructuredEventJSON;

const isUuidV4 = (id: string) => validate(id) && version(id) === 4;
export const internalQuerySchema = object({
  ...queryEventSchema.entries,
  __typename: literal('Query'),
});
export const internalCreateSchema = object({
  ...createSchema.entries,
  __typename: literal('Create'),
});
export const internalUpdateSchema = object({
  ...updateSchema.entries,
  __typename: literal('Update'),
});
export const internalNone = object({
  ...noneSchema.entries,
  __typename: literal('None'),
});

export const internalStructuredSchema = object({
  operation: union([
    internalQuerySchema,
    internalCreateSchema,
    internalUpdateSchema,
    internalNone,
  ]),
  response: string(),
});

export const promptEventResponse = object({
  __typename: literal('Create'),
  id: string(),
  name: string(),
  date: string(),
  date_unix: number(),
  duration: number(),
  color: picklist(Colors),
  description: optional(string()),
});

export const promptResponseCreate = object({
  __typename: literal('Create'),
  events: array(promptEventResponse),
});

export const promptResponseQuery = object({
  __typename: literal('Query'),
  events: array(promptEventResponse),
});

export const promptResponseUpdate = object({
  __typename: literal('Update'),
  events: array(promptEventResponse),
});

export const promptStructuredResponseSchema = object({
  promptResponse: string(),
  result: union([
    promptResponseCreate,
    promptResponseUpdate,
    promptResponseQuery,
    object({ __typename: literal('None') }),
  ]),
});

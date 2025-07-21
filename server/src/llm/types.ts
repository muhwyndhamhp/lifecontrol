import {
  array,
  fallback,
  integer,
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

export const Operations = ['Create', 'Update', 'Query', 'None'] as const;

const whereStatementsSchema = {
  whereStatements: pipe(
    array(
      object({
        column: string(),
        control: string(),
        value: string(),
      })
    )
  ),
};

const createSchemaBase = {
  name: pipe(string()),
  date: string(),
  duration: number(),
  color: fallback(pipe(string(), picklist(Colors)), 'mauve'),
  description: optional(pipe(string())),
  userId: optional(pipe(number(), integer())),
};

const updateSchemaBase = {
  set: array(
    object({
      column: string(),
      value: string(),
    })
  ),
  ...whereStatementsSchema,
};

const querySchemaBase = {
  ...whereStatementsSchema,
  paginate: pipe(
    object({
      limit: pipe(number()),
      offset: pipe(number()),
    })
  ),
  order: object({
    column: string(),
    direction: string(),
  }),
};

// LLM-facing Schemas (for JSON schema generation)
export const createSchema = object({
  __typename: picklist(Operations, 'Create'),
  ...createSchemaBase,
});

export const updateSchema = object({
  __typename: picklist(Operations, 'Update'),
  ...updateSchemaBase,
});

export const queryEventSchema = object({
  __typename: picklist(Operations, 'Query'),
  ...querySchemaBase,
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
});

export const { $schema, ...StructuredEventJSONSchema } = StructuredEventJSON;

// Internal-facing Schemas (for application logic)
export const internalCreateSchema = object({
  __typename: literal('Create'),
  ...createSchemaBase,
});

export const internalUpdateSchema = object({
  __typename: literal('Update'),
  ...updateSchemaBase,
});

export const internalQuerySchema = object({
  __typename: literal('Query'),
  ...querySchemaBase,
});

export const internalNone = object({
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

// Prompt Response Schemas
export const promptEventResponse = object({
  id: string(),
  name: string(),
  date: string(),
  date_unix: number(),
  duration: number(),
  color: picklist(Colors),
  description: optional(string()),
  user_id: optional(number()),
});

const createPromptResponseSchema = <T extends 'Create' | 'Update' | 'Query'>(
  type: T
) =>
  object({
    __typename: literal(type),
    events: array(promptEventResponse),
  });

export const promptResponseCreate = createPromptResponseSchema('Create');
export const promptResponseQuery = createPromptResponseSchema('Query');
export const promptResponseUpdate = createPromptResponseSchema('Update');

export const promptStructuredResponseSchema = object({
  promptResponse: string(),
  result: union([
    promptResponseCreate,
    promptResponseUpdate,
    promptResponseQuery,
    object({ __typename: literal('None') }),
  ]),
});

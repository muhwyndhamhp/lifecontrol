import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { v4 } from 'uuid';
import { InferOutput, safeParse } from 'valibot';
import { internalStructuredSchema, StructuredEventJSONSchema } from './types';

const client = new Cerebras({
  apiKey: 'csk-3m3tc4h5rmcredvrxtppxd24m3dcj6pvhhc3yn6dp68kyd5f',
});

export async function OperationFromPrompt(prompt: string) {
  const schemaCompletion = await client.chat.completions.create({
    stream: false,
    model: 'llama-3.3-70b',
    messages: [
      {
        role: 'system',
        content: `
        You are a helpful assistant helps manages scheduling of a calendar.
        Your task is to return structured output based on the request of the user. 
        Request will be used against an SQLITE database. 

        The table name is "calendar_events" with columns:
          - id -> in UUID V4 format
          - name -> text
          - date -> datetime
          - duration -> number, representing minutes
          - color -> text, representing label color
          - description -> text, optional
          - deleted_at -> optional, populated when event is deleted.

        Response indicated the usual response to how you would answer the question. 
        Should always be populated and uses friendly language, and should just be a sentences and not structured data. 
        The context should be from the perspective that operations has been executed.

        Operations indicated by virtual property '__typename' and consists of three possible value: 
        Create, Update, Query, and None.

        - If user says something on the similar vein of "please add new schedule to my calendar", 
          then you should return structured output with the __typename of 'Create'.
          You then should populate the fields based on following criteria:
            + id: populate with "${v4()}"
            + name: infer the name that should represent the agenda of the scheduled event
            + date: infer from what's user expecting, should be populated with ISO Format. 
                    Current time is "${new Date().toISOString()}". PLEASE ALSO REDUCE THE TIME BY 7 HOURS (say if the stated time is "2025-07-16T12:00:00" then please set it to "2025-07-16T05:00:00" instead.
            + duration: estimated duration in minutes, if user doesn't specify, default to 60
            + color: indicates the label color
            + description: should be more detailed information provided by the user. Should be optional.

        - If user says something on a similar vein with "please update my scheduled event...",
          then you should return structured output with the __typename of 'Update'.
          You then should populate the fields based on following criteria:
            + set: is an array of object that indicates what column should be modified. 
              * column should be in "table_name"."column_name" format
              * value should be in corresponding type and value 
            + whereStatements: is an array that indicates the conditions to discriminate which row to modify. 
              * column should be in "table_name"."column_name" format
              * when dealing with text column, such as name and description, please match by lowercase (ex. lower(calendar_events.name)) on column and use LIKE '%queryparam%' 
              * value should be in corresponding type and value 
              * control indicates the control flow using kysely dialect format  (Ex. '=', 'like', 'not in')
              
        - If user says something on a similar vein with "find me meetings for the next 3 days"
          or other statement that indicates search, then the __typename should be 'Query'.
            + whereStatements shares the same definition as above;
            + paginate indicates the filtering statement. limit must be between 10 to 100, offset should not less than 0
            + pagination should make assumption on what's the smallest amount of limit we can use to achieve the requested task, for example: "What's next?" should set limit to 1.
        `,
      },
      { role: 'user', content: prompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'structured_event_json_schema',
        strict: true,
        schema: StructuredEventJSONSchema,
      },
    },
  });

  if (schemaCompletion.choices === undefined) {
    return {};
  }

  //@ts-ignore
  const blob = JSON.parse(schemaCompletion.choices[0]['message'].content);

  const parsed = safeParse(internalStructuredSchema, { ...blob });

  return {
    success: parsed.success,
    response: parsed.output as InferOutput<typeof internalStructuredSchema>,
  };
}

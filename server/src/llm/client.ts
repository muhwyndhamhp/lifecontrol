import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { v4 } from 'uuid';
import { InferOutput, safeParse } from 'valibot';
import { internalStructuredSchema, StructuredEventJSONSchema } from './types';
import { Colors } from '../schemas/calendarEvent';

const client = new Cerebras({
  apiKey: '',
});

export async function OperationFromPrompt(prompt: string, timeOffset: number) {
  const date = new Date();
  date.setHours(date.getUTCHours() - timeOffset);

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
          - date_unix -> date but in unix timestamp number instead
          - duration -> number, representing minutes
          - color -> text, representing label color
          - description -> text
          - deleted_at -> optional, populated when event is deleted.

        Response indicated the usual response to how you would answer the question. 
        Should always be populated and uses friendly language, and should just be a sentences and not structured data. 
        The context should be from the perspective that operations has been executed.

        Operations indicated by virtual property '__typename' and consists of three possible value: 
        Create, Update, Query, and None.

        - If user says something on the similar vein of "please add new schedule to my calendar" or "please add ...", 
          then you should return structured output with the __typename of 'Create'.
          You then should populate the fields based on following criteria:
            + id: populate with "${v4()}"
            + name: infer the name that should represent the agenda of the scheduled event
            + date: infer from what's user expecting, should be populated with ISO Format. Current time is "${date.toISOString()}". 
            + duration: estimated duration in minutes, if user doesn't specify, default to 60
            + color: indicates the label color, values should be one of these: "${Colors.toString()}", if user not specified, choose randomly.
            + description: should be more detailed information provided by the user. Should not be optional.

        - If user says something on a similar vein with "please update my scheduled event...",
          then you should return structured output with the __typename of 'Update'.
          You then should populate the fields based on following criteria:
            + Current time is "${date.toISOString()}"
            + set: is an array of object that indicates what column should be modified. 
              * column should be in column_name ONLY format
              * value should be in corresponding type and value 
            + whereStatements: is an array that indicates the conditions to discriminate which row to modify. 
              * column should be in table_name.column_name format
              * when dealing with text column, such as name and description, please use LIKE '%queryparam%' 
              * please always add date range where statement that matches user's requirement whenever possible, 
                for example if user said "please update today's dinner" then make sure it has where table_name.table_column >= 'beginning of day' and where table_name.table_column <= 'end of day'
                BUT PLEASE AVOID DATE EQUALITY EXPRESSION.
              * value should be in corresponding type and value 
              * control indicates the control flow using kysely dialect format  (Ex. '=', 'like', 'not in')
              
        - If user says something on a similar vein with "find me meetings for the next 3 days"
          or other statement that indicates search, then the __typename should be 'Query'.
            + Current time is "${date.toISOString()}"
            + whereStatements shares the same definition as above;
            + by default query should be ordered by date_unix unless user stated otherwise, ex. order by calendar_events.date_unix asc.
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

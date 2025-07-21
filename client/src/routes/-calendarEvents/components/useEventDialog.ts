import type { CalendarEvent } from '@clientTypes/calendarEvent';
import { client } from '@lib/fetcher';
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
} from '@server/schemas/calendarEvent';
import type { ClientResponse } from 'hono/client';
import { useRef, useCallback, type FormEvent } from 'react';
import { safeParse } from 'valibot';

export function useEventDialog(existing?: CalendarEvent) {
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const form = formRef.current;
      if (!form) {
        return;
      }

      const formData = new FormData(form);
      const values = Object.fromEntries(formData.entries());

      let fetch: Promise<ClientResponse<{ success: boolean }>> | undefined =
        undefined;

      if (!existing) {
        const parsed = safeParse(createCalendarEventSchema, {
          ...values,
          dateUnix: new Date(values['date'] as string).getTime() / 1000,
        });

        if (!parsed.success) {
          return;
        }

        fetch = client.api.events.create.$post({
          json: parsed.output,
        });
      } else {
        const parsed = safeParse(updateCalendarEventSchema, {
          ...values,
          id: existing.id,
          dateUnix: new Date(values['date'] as string).getTime() / 1000,
        });

        if (!parsed.success) {
          return;
        }

        fetch = client.api.events.update.$post({
          json: parsed.output,
        });
      }

      const blob: ClientResponse<{ success: boolean }> = await fetch;
      const res = (await blob.json()) as { success: boolean };
      if (!res.success) {
        console.log('Create event not successful');
      }

      dialogRef.current?.togglePopover();
    },
    [existing]
  );

  const deleteEvent = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const blob = await client.api.events[':id'].$delete({
        param: {
          id: existing?.id ?? '',
        },
      });

      const res = await blob.json();

      if (!res.success) {
        console.log('Delete event not successful');
      }

      dialogRef.current?.togglePopover();
    },
    [existing?.id]
  );

  const dateString = formatDateTimeLocal(
    existing ? new Date(existing?.date) : new Date()
  );

  return { deleteEvent, dateString, submit, formRef, dialogRef };
}

function formatDateTimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

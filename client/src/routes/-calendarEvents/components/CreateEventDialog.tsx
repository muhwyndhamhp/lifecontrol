import {
  Colors,
  createCalendarEventSchema,
  updateCalendarEventSchema,
} from '@server/schemas/calendarEvent.ts';
import { css } from '@stitches/react';
import { type FormEvent, useCallback, useRef } from 'react';
import { safeParse } from 'valibot';
import { client } from '@lib/fetcher';
import type { CalendarEvent } from '@clientTypes/calendarEvent';
import { type ClientResponse } from 'hono/client';

export interface CreateEventDialogProps {
  existing?: CalendarEvent;
  idSuffix?: string;
  onSubmit: () => void;
}

export function CreateEventDialog({
  onSubmit,
  existing,
  idSuffix,
}: CreateEventDialogProps) {
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

      onSubmit();
    },
    [existing, onSubmit]
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

      onSubmit();
    },
    [existing?.id, onSubmit]
  );

  const dateString = formatDateTimeLocal(
    existing ? new Date(existing?.date) : new Date()
  );

  return (
    <dialog
      id={`dialog${idSuffix ? '-' + idSuffix : ''}`}
      popover={'auto'}
      className={createDialog()}
      ref={dialogRef}
    >
      <form box-="round" id="content" ref={formRef}>
        <div className={content()}>
          <label box-="round" shear-="top">
            <div style={{ display: 'flex' }}>
              <span is-="badge" variant-="background0">
                Event Name
              </span>
            </div>
            <input
              name="name"
              contentEditable
              className={inputBox()}
              placeholder={'Birthday'}
              defaultValue={existing?.name}
            ></input>
          </label>{' '}
          <label box-="round" shear-="top">
            <div style={{ display: 'flex' }}>
              <span is-="badge" variant-="background0">
                Date
              </span>
            </div>
            <input
              name="date"
              type="datetime-local"
              className={inputBox()}
              defaultValue={dateString}
            />
          </label>
          <label box-="round" shear-="top">
            <div style={{ display: 'flex' }}>
              <span is-="badge" variant-="background0">
                Duration (In Minutes)
              </span>
            </div>
            <input
              name="duration"
              contentEditable
              className={inputBox()}
              placeholder={'30'}
              defaultValue={existing?.duration}
            ></input>
          </label>{' '}
          <div box-="round" shear-="top">
            <div>
              <span is-="badge" variant-="background0">
                Label Color
              </span>
            </div>
            <div className={inputBox()}>
              {Colors.map((c) => (
                <label>
                  <input
                    type="radio"
                    name="color"
                    value={c}
                    defaultChecked={existing?.color === c}
                  />
                  <span is-={'badge'} variant-={c}>
                    {c}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <label box-="round" shear-="top">
            <div style={{ display: 'flex' }}>
              <span is-="badge" variant-="background0">
                Description
              </span>
            </div>
            <textarea
              name="description"
              contentEditable
              className={inputBox()}
              style={{
                lineHeight: '3',
              }}
              placeholder={'description'}
              defaultValue={existing?.description}
            ></textarea>
          </label>{' '}
          <button
            variant-="mauve"
            onClick={submit}
            type="submit"
            style={{ width: 'calc(100% - 1ch)', margin: '0lh auto' }}
          >
            {existing ? 'Update' : 'Create'}
          </button>
          {existing && (
            <button
              variant-="red"
              box-="round"
              type="submit"
              onClick={deleteEvent}
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </dialog>
  );
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

const content = css({
  position: 'relative',
  padding: '0lh 1ch',
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100% - 2lh)',
});

const inputBox = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5lh',
  color: 'var(--text)',
  padding: '0.25lh 1ch',
  fontFamily: 'Zed Mono',
  minWidth: '45ch',
  background: 'var(--background0)',
  borderColor: 'transparent',
});

const createDialog = css({
  margin: 'auto',
  backgroundColor: 'var(--background0)',
  borderColor: 'transparent',
  '&::backdrop': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

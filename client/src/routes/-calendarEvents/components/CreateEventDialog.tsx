import { Colors } from '@server/schemas/calendarEvent.ts';
import { css } from '@stitches/react';
import type { CalendarEvent } from '@clientTypes/calendarEvent';
import { useEventDialog } from './useEventDialog';

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
  const { deleteEvent, dateString, submit, formRef, dialogRef, loading } =
    useEventDialog(existing);

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
              placeholder={'description'}
              defaultValue={existing?.description}
            ></textarea>
          </label>{' '}
          <button
            variant-="mauve"
            onClick={async (e) => {
              await submit(e);
              onSubmit();
            }}
            type="submit"
            disabled={loading}
            style={{ width: 'calc(100% - 1ch)', margin: '0lh auto' }}
          >
            {existing ? 'Update' : 'Create'}
          </button>
          {existing && (
            <button
              variant-="red"
              box-="round"
              type="submit"
              onClick={async (e) => {
                await deleteEvent(e);
                onSubmit();
              }}
              disabled={loading}
            >
              Delete
            </button>
          )}
        </div>
        <span style={{ visibility: loading ? 'visible' : 'hidden' }}>
          <span is-="spinner" variant-="bar-horizontal"></span>
          Loading...
        </span>
      </form>
    </dialog>
  );
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

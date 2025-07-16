import { css } from '@stitches/react';

export function ChatBox() {
  return (
    <>
      <div className={chatBox()}>
        <div
          box-="round"
          style={{
            width: '100%',
            height: 'calc(100vh - 7lh)',
          }}
        ></div>
        <label box-="round" shear-="top">
          <div style={{ display: 'flex' }}>
            <span is-="badge" variant-="background0">
              Chat Input
            </span>
          </div>
          <input
            name="name"
            contentEditable
            className={inputBox()}
            placeholder={'Birthday'}
          ></input>
        </label>{' '}
      </div>
    </>
  );
}

const chatBox = css({
  width: '100%',
  height: 'calc(100vh - 4lh)',
  margin: '0lh 1ch 0lh 0ch',
  display: 'flex',
  flexDirection: 'column',
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

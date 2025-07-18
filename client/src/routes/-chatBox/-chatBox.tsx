import { css } from '@stitches/react';
import { useCallback, useState } from 'react';
import { client } from '../../fetcher.ts';

export function ChatBox() {
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const submitPrompts = useCallback(
    async (message: string) => {
      setChatHistory((prev) => {
        return [...prev, JSON.stringify(message, null, 2)];
      });

      const response = await client.api.prompt.$post({
        json: {
          prompt: message,
        },
      });

      const resJson = await response.json();
      setChatHistory((prev) => {
        return [...prev, JSON.stringify(resJson, null, 2)];
      });
    },
    [setChatHistory]
  );

  console.log(chatHistory);

  return (
    <>
      <div className={chatBox()}>
        <div
          box-="round"
          style={{
            width: '100%',
            height: 'calc(100vh - 7lh)',
          }}
        >
          {chatHistory.map((v, i) => {
            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor:
                    i % 2 === 0 ? 'var(--background0)' : 'var(--background2)',
                }}
              >
                {v}
                <div is-="separator"></div>
              </div>
            );
          })}
        </div>
        <label box-="round" shear-="top">
          <div style={{ display: 'flex' }}>
            <span is-="badge" variant-="background0">
              Chat Input
            </span>
          </div>
          <input
            name="name"
            contentEditable
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                submitPrompts(e.currentTarget.value);
              }
            }}
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
  width: '100%',
  background: 'var(--background0)',
  borderColor: 'transparent',
});

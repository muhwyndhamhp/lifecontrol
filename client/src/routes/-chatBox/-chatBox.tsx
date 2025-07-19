import { css } from '@stitches/react';
import { useCallback, useEffect, useState } from 'react';
import { client } from '../../fetcher.ts';
import type { CalendarEvent } from '../-calendarEvents/-eventSlot.tsx';
import { useAppStore } from '../../store.ts';

export function ChatBox() {
  const setRange = useAppStore((state) => state.setRange);

  const [chatHistory, setChatHistory] =
    useState<ChatMessage[]>(loadChatHistory());

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      // The 'document.hidden' property is a boolean
      if (document.hidden) {
        saveChatHistory(chatHistory);
      }
    };

    // Add the event listener when the component mounts
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Return a cleanup function to remove the listener when the component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [chatHistory]);

  const submitPrompts = useCallback(
    async (message: string) => {
      setChatHistory((prev) => {
        setLoading(true);
        return [...prev, { message, author: 'client' }];
      });

      const response = await client.api.prompt.$post({
        json: {
          prompt: message,
          hourOffset: new Date().getTimezoneOffset() / 60,
        },
      });

      const json = await response.json();
      const resJson = json.result;
      switch (resJson.__typename) {
        case 'None': {
          setChatHistory((prev) => {
            return [
              ...prev,
              { message: json.promptResponse, author: 'server' },
            ];
          });
          break;
        }
        case 'Create': {
          setChatHistory((prev) => {
            return [
              ...prev,
              {
                message: json.promptResponse,
                author: 'server',
                structuredResponse: resJson.events as CalendarEvent[],
              },
            ];
          });
          break;
        }
      }

      setLoading(false);
    },
    [setChatHistory]
  );

  useEffect(() => {
    document
      .getElementById(`chat-history-${chatHistory.length - 1}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [chatHistory]);

  console.log(chatHistory);

  return (
    <>
      <div className={chatBox()}>
        <div
          box-="round"
          style={{
            padding: '1lh 1ch',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 7lh)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'scroll',
              width: '100%',
            }}
          >
            {chatHistory.map((v, idx) => {
              return (
                <div
                  id={`chat-history-${idx}`}
                  style={{
                    padding: '1lh 2ch',
                    display: 'flex',
                    flexDirection: 'column',
                    margin: v.author === 'client' ? '0lh 0ch 0lh auto' : '',
                    backgroundColor:
                      v.author === 'client'
                        ? 'var(--background0)'
                        : 'var(--background2)',
                  }}
                >
                  <span>{`"${v.message}"`}</span>
                  {v.structuredResponse &&
                    v.structuredResponse?.map((c) => (
                      <div
                        onClick={() => {
                          const start = new Date(c.date_unix * 1000);
                          start.setHours(0, 0, 0, 0);
                          const end = new Date(start);
                          end.setDate(start.getDate() + 1);

                          setRange({ start, end });
                        }}
                        style={{
                          padding: '1lh 1ch',
                          margin: '1lh 2ch',
                          maxWidth: '37ch',
                          backgroundColor: `var(--${c?.color})`,
                          color: `var(--background0)`,
                        }}
                      >
                        <p
                          style={{
                            margin: '0lh 1ch',
                            color: `var(--background0)`,
                          }}
                        >
                          {c?.name}
                        </p>
                        <p
                          style={{
                            margin: '1lh 1ch 0lh 1ch',
                            color: `var(--background3)`,
                          }}
                        >
                          {`Scheduled at ${new Date(c?.date).toISOString().slice(0, 16)},`}
                        </p>
                        <p
                          style={{
                            margin: '0lh 1ch',
                            color: `var(--background3)`,
                          }}
                        >
                          {`for ${c?.duration} minutes`}
                        </p>
                        <p
                          style={{
                            margin: '1lh 1ch 0lh 1ch',
                            color: `var(--background3)`,
                          }}
                        >
                          Description:
                        </p>
                        <blockquote
                          style={{
                            margin: '0lh 1ch',
                            color: `var(--background0)`,
                          }}
                        >
                          {c.description}
                        </blockquote>
                      </div>
                    ))}
                </div>
              );
            })}
            {loading && (
              <div
                style={{
                  padding: '1lh 2ch',
                  backgroundColor: 'var(--background2)',
                }}
              >
                <span>
                  <span is-="spinner" variant-="dots"></span> Working...
                </span>
              </div>
            )}
          </div>
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
                e.currentTarget.value = '';
              }
            }}
            className={inputBox()}
            placeholder={`When `}
          ></input>
        </label>{' '}
      </div>
    </>
  );
}

export type ChatMessage = {
  message: string;
  author: 'server' | 'client';
  structuredResponse?: CalendarEvent[];
};

const CHAT_HISTORY_KEY = 'chatHistory';

// eslint-disable-next-line react-refresh/only-export-components
export const saveChatHistory = (history: ChatMessage[]): void => {
  try {
    const serializedHistory = JSON.stringify(history);
    localStorage.setItem(CHAT_HISTORY_KEY, serializedHistory);
  } catch (error) {
    console.error('Error saving chat history to localStorage:', error);
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const loadChatHistory = (): ChatMessage[] => {
  try {
    const serializedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (serializedHistory === null) {
      return []; // No history found
    }
    return JSON.parse(serializedHistory);
  } catch (error) {
    console.error('Error loading chat history from localStorage:', error);
    return []; // Return empty array on error
  }
};

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

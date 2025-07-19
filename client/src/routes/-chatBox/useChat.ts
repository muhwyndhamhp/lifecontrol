import { useCallback, useEffect, useState } from 'react';
import { client } from '../../fetcher.ts';
import type { CalendarEvent } from '../-calendarEvents/components/EventSlot.tsx';

export type ChatMessage = {
  message: string;
  author: 'server' | 'client';
  structuredResponse?: CalendarEvent[];
};

const CHAT_HISTORY_KEY = 'chatHistory';

const saveChatHistory = (history: ChatMessage[]): void => {
  try {
    const serializedHistory = JSON.stringify(history);
    localStorage.setItem(CHAT_HISTORY_KEY, serializedHistory);
  } catch (error) {
    console.error('Error saving chat history to localStorage:', error);
  }
};

const loadChatHistory = (): ChatMessage[] => {
  try {
    const serializedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (serializedHistory === null) {
      return [];
    }
    return JSON.parse(serializedHistory);
  } catch (error) {
    console.error('Error loading chat history from localStorage:', error);
    return [];
  }
};

export function useChat() {
  const [chatHistory, setChatHistory] =
    useState<ChatMessage[]>(loadChatHistory());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveChatHistory(chatHistory);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [chatHistory]);

  const submitPrompt = useCallback(async (message: string) => {
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
        setChatHistory((prev) => [
          ...prev,
          { message: json.promptResponse, author: 'server' },
        ]);
        break;
      }
      case 'Create':
      case 'Update': {
        setChatHistory((prev) => [
          ...prev,
          {
            message: json.promptResponse,
            author: 'server',
            structuredResponse: resJson.events as CalendarEvent[],
          },
        ]);
        break;
      }
    }
    setLoading(false);
  }, []);

  return { chatHistory, loading, submitPrompt };
}

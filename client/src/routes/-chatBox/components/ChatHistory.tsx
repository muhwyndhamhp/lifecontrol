import { css } from '@stitches/react';
import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../useChat.ts';
import { ChatMessageItem } from './components/ChatMessageItem.tsx';
import { useAppStore } from '@lib/store.ts';
import { HelpDialog } from './components/HelpDialog.tsx';
import { WelcomeMessage } from './components/WelcomeMessage.tsx';

type ChatHistoryProps = {
  chatHistory: ChatMessage[];
  loading: boolean;
};

export function ChatHistory({ chatHistory, loading }: ChatHistoryProps) {
  const keys = useAppStore((state) => state.keys);

  const divRef = useRef<HTMLDivElement>(null);

  function handleScroll(k: string[]) {
    const goUp = k.findIndex((v) => v === 'u') !== -1;
    const goDown = k.findIndex((v) => v === 'd') !== -1;

    if (goUp && goDown) return;
    if (!goUp && !goDown) return;

    if (goUp) divRef?.current?.scrollBy({ top: -200, behavior: 'smooth' });
    if (goDown) divRef?.current?.scrollBy({ top: 200, behavior: 'smooth' });
  }

  function handleHelp(k: string[]) {
    const questionMark = k.findIndex((v) => v === 'h') !== -1;
    if (questionMark) document.getElementById('help-dialog')?.togglePopover();
  }

  useEffect(() => {
    handleScroll(keys);
    handleHelp(keys);
  }, [keys]);

  useEffect(() => {
    document
      .getElementById(`chat-history-${chatHistory.length - 1}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [chatHistory]);

  return (
    <div className={chatHistoryContainer()} ref={divRef}>
      {chatHistory.length > 0 ? (
        chatHistory.map((v, idx) => (
          <ChatMessageItem key={idx} chatMessage={v} index={idx} />
        ))
      ) : (
        <WelcomeMessage />
      )}
      {loading ? (
        <div className={loadingIndicator()}>
          <span>
            <span is-="spinner" variant-="dots"></span> Working...
          </span>
        </div>
      ) : (
        <div className={helpIndicator()}>
          <span>
            Need help? Press <span className={keybind()}>`h`</span> to open help
            dialog.
          </span>
          <HelpDialog />
        </div>
      )}
    </div>
  );
}

const chatHistoryContainer = css({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'scroll',
  width: '100%',
  height: '100%',
});

const loadingIndicator = css({
  padding: '1lh 2ch',
  backgroundColor: 'var(--background2)',
});

const helpIndicator = css({
  padding: '1lh 2ch',
  marginTop: 'auto',
  backgroundColor: 'var(--background2)',
});

const keybind = css({
  color: 'var(--red)',
});

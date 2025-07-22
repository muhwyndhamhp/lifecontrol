import { css } from '@stitches/react';
import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../useChat.ts';
import { ChatMessageItem } from './components/ChatMessageItem.tsx';
import { useAppStore } from '@lib/store.ts';

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
    const questionMark = k.findIndex((v) => v === '?') !== -1;

    console.log('*** Question Mar: ', questionMark);
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
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ width: '40ch', margin: 'auto', textAlign: 'center' }}>
            <p>Welcome to Life Control!</p>
            <p style={{ textAlign: 'justify', margin: '1lh 0ch' }}>
              To add event you can press "Add Event" below or pressing{' '}
              <span className={keybind()}>`a`</span> button on your keyboard.
            </p>
            <p style={{ textAlign: 'justify', margin: '1lh 0ch' }}>
              Or you can press either <span className={keybind()}>`i`</span> or{' '}
              <span className={keybind()}>`/`</span> to focus on the input to
              start chatting with the calendar assistant.
            </p>
          </div>
        </div>
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
            Need help? Press <span className={keybind()}>`?`</span> to open help
            dialog.
          </span>
          <dialog popover="auto" id="help-dialog" className={helpDialog()}>
            <div box-="round" id="content">
              <div className={content()}>
                <table className={helpTable()}>
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className={keybind()}>`?`</span>
                      </td>
                      <td>Open this help dialog</td>
                    </tr>
                    <tr>
                      <td>
                        <span className={keybind()}>`&lt;`</span>
                      </td>
                      <td>Go to the previous date</td>
                    </tr>
                    <tr>
                      <td>
                        <span className={keybind()}>`&gt;`</span>
                      </td>
                      <td>Go to the next date</td>
                    </tr>
                    <tr>
                      <td>
                        <span className={keybind()}>`k`</span>
                      </td>
                      <td>Scroll up on calendar view</td>
                    </tr>
                    <tr>
                      <td>
                        <span className={keybind()}>`j`</span>
                      </td>
                      <td>Scroll down on calendar view</td>
                    </tr>
                    <tr>
                      <td>
                        <span className={keybind()}>`0-9`</span>
                      </td>
                      <td>Open event details (by index)</td>
                    </tr>
                    <tr>
                      <td>
                        <span className={keybind()}>`u`</span>
                      </td>
                      <td>Scroll up on chat window</td>
                    </tr>
                    <tr>
                      <td>
                        <span className={keybind()}>`d`</span>
                      </td>
                      <td>Scroll down on chat window</td>
                    </tr>
                    <tr>
                      <td>
                        <span className={keybind()}>`i` or `/`</span>
                      </td>
                      <td>Focus on chat input</td>
                    </tr>
                    <tr>
                      <td>
                        <span className={keybind()}>`a`</span>
                      </td>
                      <td>Open create event dialog</td>
                    </tr>
                    <tr>
                      <td>
                        <span className={keybind()}>`Shift` + `k`</span>
                      </td>
                      <td>Clear chat dialog</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </dialog>
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

const content = css({
  position: 'relative',
  padding: '0lh 1ch',
  display: 'flex',
  flexDirection: 'column',
  gap: '1lh',
  height: 'calc(100% - 2lh)',
  maxWidth: '70ch',
});

const helpTable = css({
  color: 'var(--text)',
  '--table-border-color': 'var(--background1)',
});

const helpDialog = css({
  margin: 'auto',
  backgroundColor: 'var(--background0)',
  borderColor: 'transparent',
  '&::backdrop': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

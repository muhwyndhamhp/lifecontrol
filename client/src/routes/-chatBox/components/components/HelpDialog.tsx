import { css } from '@stitches/react';

const keybindings = [
  { key: '?', description: 'Open this help dialog' },
  { key: '<', description: 'Go to the previous date' },
  { key: '>', description: 'Go to the next date' },
  { key: 'k', description: 'Scroll up on calendar view' },
  { key: 'j', description: 'Scroll down on calendar view' },
  { key: '0-9', description: 'Open event details (by index)' },
  { key: 'u', description: 'Scroll up on chat window' },
  { key: 'd', description: 'Scroll down on chat window' },
  { key: 'i or /', description: 'Focus on chat input' },
  { key: 'a', description: 'Open create event dialog' },
  { key: 'Shift + k', description: 'Clear chat dialog' },
  { key: 'Esc', description: 'Exit chat input mode' },
];

export function HelpDialog() {
  return (
    <dialog popover="auto" id="help-dialog" className={helpDialog()}>
      <div box-="round" id="content">
        <div className={content()}>
          <table className={helpTable()}>
            <thead>
              <tr>
                <th className={tableKey()}>Key</th>
                <th className={tableDescription()}>Action</th>
              </tr>
            </thead>
            <tbody>
              {keybindings.map(({ key, description }) => (
                <tr key={key}>
                  <td className={tableKey()}>
                    <span className={keybind()}>{`\`${key}\``}</span>
                  </td>
                  <td className={tableDescription()}>{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() =>
              document.getElementById('help-dialog')?.togglePopover()
            }
            style={{ width: '100%' }}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

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

const tableKey = css({
  paddingInlineStart: '2ch',
  textAlign: 'center',
  paddingInlineEnd: '2ch',
});

const tableDescription = css({
  minWidth: '40ch',
  paddingInlineStart: '1ch',
});

const helpDialog = css({
  margin: 'auto',
  backgroundColor: 'var(--background0)',
  borderColor: 'transparent',
  '&::backdrop': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

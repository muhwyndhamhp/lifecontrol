export function LoadingIndicator() {
  return (
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
  );
}

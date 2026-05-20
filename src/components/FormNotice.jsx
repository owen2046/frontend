export default function FormNotice({ notice }) {
  if (!notice) return null
  const isError = notice.type === 'error'
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        zIndex: 1000,
        maxWidth: 360,
        padding: '14px 18px',
        borderRadius: 8,
        background: isError ? '#fff5f5' : '#f4fbf6',
        border: `1px solid ${isError ? '#f2b8b5' : '#a8d8b1'}`,
        color: isError ? '#9f1d1d' : '#1f6b36',
        boxShadow: '0 14px 40px rgba(28,28,30,0.16)',
        fontSize: '0.88rem',
        lineHeight: 1.5,
      }}
    >
      {notice.message}
    </div>
  )
}

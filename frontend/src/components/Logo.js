export default function SwaprLogo({ size = 120, className = '' }) {
  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      style={{
        minHeight: size,
        padding: '0.5rem 1rem',
        borderRadius: '0.75rem',
        backgroundColor: '#ffffff',
        scale: '1.3', // Fully transparent
      }}
    >
      {/* Exchange arrows icon */}
      <svg
        width={size * 0.4}
        height={size * 0.4}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#000000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="M21 10h-6V4" />
        <path d="M3 14h6v6" />
        <path d="M21 10l-7.5 7.5" />
        <path d="M3 14l7.5-7.5" />
      </svg>

      {/* Swapr wordmark */}
      <span
        style={{
          fontFamily: "'Playfair Display', 'Georgia', serif",
          fontWeight: 700,
          fontSize: size * 0.42,
          color: '#1c398e',
          letterSpacing: '0.01em',
          userSelect: 'none',
        }}
      >
        Swapr
      </span>
    </div>
  );
}

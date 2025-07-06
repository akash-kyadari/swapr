export default function Avatar({ src, alt, name, size = 40 }) {
  if (src) {
    return <img src={src} alt={alt || name} className="rounded-full object-cover shadow-md border-2 border-white" style={{ width: size, height: size }} />;
  }
  // Fallback: initials with gradient background
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  return (
    <div className="rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white flex items-center justify-center font-bold shadow-md border-2 border-white" style={{ width: size, height: size }}>
      {initials}
    </div>
  );
} 
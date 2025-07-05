export default function Avatar({ src, alt, name, size = 40 }) {
  if (src) {
    return <img src={src} alt={alt || name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  // Fallback: initials
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  return (
    <div className="rounded-full bg-primary text-white flex items-center justify-center font-bold" style={{ width: size, height: size }}>
      {initials}
    </div>
  );
} 
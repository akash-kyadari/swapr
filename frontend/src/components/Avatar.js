import { useState } from 'react';

export default function Avatar({ src, alt, name, size = 40 }) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    const nameParts = name.trim().split(' ').filter(Boolean);
    if (nameParts.length === 0) return '?';
    return (nameParts[0].charAt(0) + (nameParts[1]?.charAt(0) || '')).toUpperCase();
  };

  const initials = getInitials(name);
  const fontSize =
    size <= 24 ? 'text-xs' :
    size <= 32 ? 'text-sm' :
    size <= 48 ? 'text-base' :
    size <= 64 ? 'text-lg' :
    'text-xl';

  // If valid src and no error, render image avatar
  if (src && src.trim() && !imageError) {
    return (
      <img
        src={src}
        alt={alt || name || 'User avatar'}
        className="rounded-full object-cover shadow-md border-2 border-white hover:shadow-lg transition-shadow duration-200"
        style={{ width: size, height: size }}
        onError={() => setImageError(true)}
      />
    );
  }

  // Fallback avatar with blue gradient background
  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold text-white border-2 border-white shadow-md hover:shadow-lg transition-all duration-200 ${fontSize}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg,rgb(128, 163, 238), #1d4ed8)', // Tailwind's blue-600 to blue-700
        textTransform: 'uppercase',
      }}
    >
      {initials}
    </div>
  );
}

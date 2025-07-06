import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import useThemeStore from '../store/useThemeStore';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
      className={`p-2 rounded-full border border-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors ${className}`}
    >
      {theme === 'dark' ? (
        <SunIcon className="w-5 h-5 text-yellow-400" />
      ) : (
        <MoonIcon className="w-5 h-5 text-secondary-700" />
      )}
    </button>
  );
} 
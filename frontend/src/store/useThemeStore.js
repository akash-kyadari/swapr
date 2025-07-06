import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const current = get().theme;
        const next = current === 'light' ? 'dark' : 'light';
        set({ theme: next });
        // Apply class to <html>
        if (typeof document !== 'undefined') {
          const html = document.documentElement;
          html.classList.remove(current);
          html.classList.add(next);
        }
      },
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          const html = document.documentElement;
          html.classList.remove('light', 'dark');
          html.classList.add(theme);
        }
      },
    }),
    {
      name: 'theme-preference',
    },
  ),
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const { theme, setTheme } = useThemeStore.getState();
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = theme || (prefersDark ? 'dark' : 'light');
  setTheme(initial);
}

export default useThemeStore; 
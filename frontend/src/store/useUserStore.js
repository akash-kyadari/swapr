import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiFetch } from '../utils/api';

const useUserStore = create(persist((set, get) => ({
  user: null,
  loading: true,
  error: '',

  setUser: user => set({ user }),
  setLoading: loading => set({ loading }),
  setError: error => set({ error }),

  // Fetch user from backend (for session persistence)
  fetchUser: async () => {
    set({ loading: true, error: '' });
    try {
      const user = await apiFetch('/api/users/me');
      set({ user, loading: false });
      console.log('User fetched:', user);
    } catch (err) {
      set({ user: null, loading: false });
      console.log('User fetch failed:', err);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('user-store');
      }
    }
  },

  // Signup
  signup: async (form) => {
    set({ loading: true, error: '' });
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      await get().fetchUser();
      set({ error: '' });
      if (typeof window !== 'undefined') window.location.href = '/';
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Login
  login: async (form) => {
    set({ loading: true, error: '' });
    try {
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      await get().fetchUser();
      set({ error: '' });
      if (typeof window !== 'undefined') window.location.href = '/';
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Logout
  logout: async () => {
    set({ loading: true });
    try {
      await apiFetch('/api/auth/logout');
    } catch {}
    set({ user: null, loading: false });
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('user-store');
      window.location.href = '/';
    }
  },
}), {
  name: 'user-store',
  getStorage: () => sessionStorage,
}));

export default useUserStore; 
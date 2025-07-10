import { create } from 'zustand';
import { apiFetch } from '../utils/api';

const useUserStore = create((set, get) => ({
  user: null,
  loading: true,
  error: '',

  setUser: user => set({ user }),
  setLoading: loading => set({ loading }),
  setError: error => set({ error }),

  // Get token from localStorage
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  },

  // Set token in localStorage
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  },

  // Clear token from localStorage
  clearToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  },

  // Fetch user from backend using stored token
  fetchUser: async () => {
    set({ loading: true, error: '' });
    try {
      console.log('Fetching user data...');
      // For Google OAuth, the token is in httpOnly cookies, so we don't need to check localStorage
      // The apiFetch function will automatically include cookies with credentials: 'include'
      const user = await apiFetch('/api/users/me');
      set({ user, loading: false });
      console.log('User fetched successfully:', user);
    } catch (err) {
      console.log('User fetch failed:', err);
      console.log('Error details:', err.message);
      set({ user: null, loading: false });
      // Don't clear localStorage token here since Google OAuth uses cookies
      // Only clear if it's a localStorage-based token
      const token = get().getToken();
      if (token) {
        get().clearToken();
      }
    }
  },

  // Signup
  signup: async (form, addToast) => {
    set({ loading: true, error: '' });
    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      
      // Store token if provided
      if (response.token) {
        get().setToken(response.token);
      }
      
      await get().fetchUser();
      set({ error: '' });
      if (addToast) addToast({ message: 'Account created successfully! Welcome to SkillSwap.', type: 'success' });
      if (typeof window !== 'undefined') window.location.href = '/';
      return true;
    } catch (err) {
      set({ error: err.message });
      if (addToast) addToast({ message: err.message || 'Failed to create account', type: 'error' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Login
  login: async (form, addToast) => {
    set({ loading: true, error: '' });
    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      
      // Store token if provided
      if (response.token) {
        get().setToken(response.token);
      }
      
      await get().fetchUser();
      set({ error: '' });
      if (addToast) addToast({ message: 'Logged in successfully!', type: 'success' });
      if (typeof window !== 'undefined') window.location.href = '/';
      return true;
    } catch (err) {
      set({ error: err.message });
      if (addToast) addToast({ message: err.message || 'Failed to login', type: 'error' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Logout
  logout: async (addToast) => {
    console.log('Logout initiated...');
    set({ loading: true });
    
    try {
      // Call backend logout to clear the cookie
      console.log('Calling backend logout endpoint...');
      await apiFetch('/api/auth/logout');
      console.log('Backend logout successful');
      if (addToast) addToast({ message: 'Logged out successfully.', type: 'info' });
    } catch (err) {
      console.error('Logout error:', err);
      if (addToast) addToast({ message: 'Logout failed. Please try again.', type: 'error' });
    } finally {
      // Always clear local state and localStorage token regardless of backend response
      console.log('Clearing local state and localStorage...');
      set({ user: null, loading: false });
      get().clearToken();
      
      // Verify localStorage is cleared
      const remainingToken = localStorage.getItem('auth-token');
      console.log('Remaining token in localStorage:', remainingToken ? 'EXISTS' : 'CLEARED');
      
      // Redirect to home page
      if (typeof window !== 'undefined') {
        console.log('Redirecting to home page...');
        window.location.href = '/';
      }
    }
  },

  // Initialize store on app load
  init: () => {
    get().fetchUser();
  },
}));

export default useUserStore; 
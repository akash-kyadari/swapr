import { create } from 'zustand';
import { nanoid } from 'nanoid';

const useToastStore = create((set) => ({
  toasts: [],
  addToast: ({ message, type = 'success', duration = 4000 }) => {
    const id = nanoid();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export default useToastStore; 
/**
 * UI Slice
 * Manages UI state including modals, toasts, and notifications
 */

import { StateCreator } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  type: string;
  props?: Record<string, any>;
  onClose?: () => void;
}

export interface UISlice {
  // State
  modals: Modal[];
  toasts: Toast[];
  isLoading: boolean;
  loadingMessage: string | null;
  sidebarOpen: boolean;
  theme: 'dark' | 'light';

  // Actions
  openModal: (modal: Modal) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  setLoading: (loading: boolean, message?: string) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  // Initial state
  modals: [],
  toasts: [],
  isLoading: false,
  loadingMessage: null,
  sidebarOpen: false,
  theme: 'dark',

  // Actions
  openModal: (modal) =>
    set((state) => ({
      modals: [...state.modals, modal],
    })),

  closeModal: (id) =>
    set((state) => ({
      modals: state.modals.filter((modal) => modal.id !== id),
    })),

  closeAllModals: () => set({ modals: [] }),

  showToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove toast after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),

  setLoading: (loading, message) =>
    set({
      isLoading: loading,
      loadingMessage: message || null,
    }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  setTheme: (theme) => set({ theme }),
});

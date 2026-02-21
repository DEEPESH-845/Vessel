/**
 * Auth Slice
 * Manages authentication state, user profile, and session management
 */

import { StateCreator } from 'zustand';
import { UserProfile, SessionData } from '@/types/auth.types';

export interface AuthSlice {
  // State
  isAuthenticated: boolean;
  user: UserProfile | null;
  session: SessionData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (session: SessionData) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  session: null,
  isLoading: false,
  error: null,

  // Actions
  login: (session) =>
    set({
      isAuthenticated: true,
      user: session.user,
      session,
      error: null,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      session: null,
      error: null,
    }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
});

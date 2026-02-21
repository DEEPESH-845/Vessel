/**
 * AI Slice
 * Manages AI assistant state, chat sessions, and transaction intents
 */

import { StateCreator } from 'zustand';
import {
  ChatSession,
  ChatMessage,
  TransactionIntent,
  ActionSuggestion,
  WalletContext,
} from '@/types/ai.types';

export interface AISlice {
  // State
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isProcessing: boolean;
  currentIntent: TransactionIntent | null;
  suggestions: ActionSuggestion[];
  walletContext: WalletContext | null;

  // Actions
  createSession: (context: WalletContext) => void;
  setCurrentSession: (session: ChatSession | null) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  setProcessing: (processing: boolean) => void;
  setCurrentIntent: (intent: TransactionIntent | null) => void;
  setSuggestions: (suggestions: ActionSuggestion[]) => void;
  addSuggestion: (suggestion: ActionSuggestion) => void;
  removeSuggestion: (index: number) => void;
  setWalletContext: (context: WalletContext) => void;
  clearSession: () => void;
}

export const createAISlice: StateCreator<AISlice> = (set) => ({
  // Initial state
  currentSession: null,
  sessions: [],
  isProcessing: false,
  currentIntent: null,
  suggestions: [],
  walletContext: null,

  // Actions
  createSession: (context) => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      messages: [],
      context,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      currentSession: newSession,
      sessions: [...state.sessions, newSession],
      walletContext: context,
    }));
  },

  setCurrentSession: (session) => set({ currentSession: session }),

  addMessage: (message) =>
    set((state) => {
      if (!state.currentSession) return state;

      const updatedSession = {
        ...state.currentSession,
        messages: [...state.currentSession.messages, message],
        updatedAt: new Date(),
      };

      return {
        currentSession: updatedSession,
        sessions: state.sessions.map((s) =>
          s.id === updatedSession.id ? updatedSession : s
        ),
      };
    }),

  updateMessage: (messageId, updates) =>
    set((state) => {
      if (!state.currentSession) return state;

      const updatedSession = {
        ...state.currentSession,
        messages: state.currentSession.messages.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
        updatedAt: new Date(),
      };

      return {
        currentSession: updatedSession,
        sessions: state.sessions.map((s) =>
          s.id === updatedSession.id ? updatedSession : s
        ),
      };
    }),

  setProcessing: (processing) => set({ isProcessing: processing }),

  setCurrentIntent: (intent) => set({ currentIntent: intent }),

  setSuggestions: (suggestions) => set({ suggestions }),

  addSuggestion: (suggestion) =>
    set((state) => ({
      suggestions: [...state.suggestions, suggestion],
    })),

  removeSuggestion: (index) =>
    set((state) => ({
      suggestions: state.suggestions.filter((_, i) => i !== index),
    })),

  setWalletContext: (context) => set({ walletContext: context }),

  clearSession: () =>
    set({
      currentSession: null,
      currentIntent: null,
      suggestions: [],
    }),
});

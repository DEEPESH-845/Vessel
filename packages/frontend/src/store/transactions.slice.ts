/**
 * Transactions Slice
 * Manages transaction history, pending transactions, and transaction tracking
 */

import { StateCreator } from 'zustand';
import { EnhancedTransaction, PendingTransaction } from '@/types/transaction.types';

export interface TransactionsSlice {
  // State
  transactions: EnhancedTransaction[];
  pendingTransactions: PendingTransaction[];
  isLoading: boolean;
  lastFetchedAt: Date | null;

  // Actions
  setTransactions: (transactions: EnhancedTransaction[]) => void;
  addTransaction: (transaction: EnhancedTransaction) => void;
  updateTransaction: (hash: string, updates: Partial<EnhancedTransaction>) => void;
  removeTransaction: (hash: string) => void;
  addPendingTransaction: (transaction: PendingTransaction) => void;
  updatePendingTransaction: (hash: string, updates: Partial<PendingTransaction>) => void;
  removePendingTransaction: (hash: string) => void;
  clearPendingTransactions: () => void;
  setLoading: (loading: boolean) => void;
  setLastFetchedAt: (date: Date) => void;
}

export const createTransactionsSlice: StateCreator<TransactionsSlice> = (set) => ({
  // Initial state
  transactions: [],
  pendingTransactions: [],
  isLoading: false,
  lastFetchedAt: null,

  // Actions
  setTransactions: (transactions) =>
    set({
      transactions,
      lastFetchedAt: new Date(),
    }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  updateTransaction: (hash, updates) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.hash === hash ? { ...tx, ...updates } : tx
      ),
    })),

  removeTransaction: (hash) =>
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.hash !== hash),
    })),

  addPendingTransaction: (transaction) =>
    set((state) => ({
      pendingTransactions: [...state.pendingTransactions, transaction],
    })),

  updatePendingTransaction: (hash, updates) =>
    set((state) => ({
      pendingTransactions: state.pendingTransactions.map((tx) =>
        tx.hash === hash ? { ...tx, ...updates } : tx
      ),
    })),

  removePendingTransaction: (hash) =>
    set((state) => ({
      pendingTransactions: state.pendingTransactions.filter((tx) => tx.hash !== hash),
    })),

  clearPendingTransactions: () => set({ pendingTransactions: [] }),

  setLoading: (loading) => set({ isLoading: loading }),

  setLastFetchedAt: (date) => set({ lastFetchedAt: date }),
});

// Alias for backward compatibility - re-export from main store
export { useAppStore as useTransactionStore } from "./index";

/**
 * Zustand Store Configuration
 * Combines all slices into a single store with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createAuthSlice, AuthSlice } from './auth.slice';
import { createWalletSlice, WalletSlice } from './wallet.slice';
import { createTransactionsSlice, TransactionsSlice } from './transactions.slice';
import { createContactsSlice, ContactsSlice } from './contacts.slice';
import { createPaymentLinksSlice, PaymentLinksSlice } from './payment-links.slice';
import { createMultiChainSlice, MultiChainSlice } from './multi-chain.slice';
import { createAISlice, AISlice } from './ai.slice';
import { createUISlice, UISlice } from './ui.slice';

// Combined store type
export type AppStore = AuthSlice &
  WalletSlice &
  TransactionsSlice &
  ContactsSlice &
  PaymentLinksSlice &
  MultiChainSlice &
  AISlice &
  UISlice;

/**
 * Main application store
 * Combines all slices with persistence for critical data
 */
export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createWalletSlice(...args),
      ...createTransactionsSlice(...args),
      ...createContactsSlice(...args),
      ...createPaymentLinksSlice(...args),
      ...createMultiChainSlice(...args),
      ...createAISlice(...args),
      ...createUISlice(...args),
    }),
    {
      name: 'vessel-wallet-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist auth state
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        
        // Persist wallet state (excluding sensitive session keys)
        wallet: state.wallet,
        
        // Persist contacts
        contacts: state.contacts,
        lastSyncedAt: state.lastSyncedAt,
        
        // Persist UI preferences
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        
        // Persist active chains
        activeChains: state.activeChains,
        
        // Persist payment links
        paymentLinks: state.paymentLinks,
      }),
    }
  )
);

// Selector hooks for better performance
export const useAuth = () =>
  useAppStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    session: state.session,
    isLoading: state.isLoading,
    error: state.error,
    login: state.login,
    logout: state.logout,
    updateUser: state.updateUser,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
  }));

export const useWallet = () =>
  useAppStore((state) => ({
    wallet: state.wallet,
    sessionKeys: state.sessionKeys,
    isDeploying: state.isDeploying,
    deploymentTxHash: state.deploymentTxHash,
    setWallet: state.setWallet,
    clearWallet: state.clearWallet,
    addSessionKey: state.addSessionKey,
    removeSessionKey: state.removeSessionKey,
    updateSessionKey: state.updateSessionKey,
    clearExpiredSessionKeys: state.clearExpiredSessionKeys,
    setDeploying: state.setDeploying,
  }));

export const useTransactions = () =>
  useAppStore((state) => ({
    transactions: state.transactions,
    pendingTransactions: state.pendingTransactions,
    isLoading: state.isLoading,
    lastFetchedAt: state.lastFetchedAt,
    setTransactions: state.setTransactions,
    addTransaction: state.addTransaction,
    updateTransaction: state.updateTransaction,
    removeTransaction: state.removeTransaction,
    addPendingTransaction: state.addPendingTransaction,
    updatePendingTransaction: state.updatePendingTransaction,
    removePendingTransaction: state.removePendingTransaction,
    clearPendingTransactions: state.clearPendingTransactions,
    setLoading: state.setLoading,
    setLastFetchedAt: state.setLastFetchedAt,
  }));

export const useContacts = () =>
  useAppStore((state) => ({
    contacts: state.contacts,
    isLoading: state.isLoading,
    lastSyncedAt: state.lastSyncedAt,
    setContacts: state.setContacts,
    addContact: state.addContact,
    updateContact: state.updateContact,
    deleteContact: state.deleteContact,
    updateContactUsage: state.updateContactUsage,
    setLoading: state.setLoading,
    setLastSyncedAt: state.setLastSyncedAt,
  }));

export const usePaymentLinks = () =>
  useAppStore((state) => ({
    paymentLinks: state.paymentLinks,
    activePaymentLink: state.activePaymentLink,
    payments: state.payments,
    isLoading: state.isLoading,
    setPaymentLinks: state.setPaymentLinks,
    addPaymentLink: state.addPaymentLink,
    updatePaymentLink: state.updatePaymentLink,
    deletePaymentLink: state.deletePaymentLink,
    setActivePaymentLink: state.setActivePaymentLink,
    addPayment: state.addPayment,
    setPayments: state.setPayments,
    setLoading: state.setLoading,
  }));

export const useMultiChain = () =>
  useAppStore((state) => ({
    assetDashboard: state.assetDashboard,
    isLoadingBalances: state.isLoadingBalances,
    activeChains: state.activeChains,
    availableRoutes: state.availableRoutes,
    activeRouteExecution: state.activeRouteExecution,
    lastBalanceUpdate: state.lastBalanceUpdate,
    setAssetDashboard: state.setAssetDashboard,
    updateAssets: state.updateAssets,
    setLoadingBalances: state.setLoadingBalances,
    setActiveChains: state.setActiveChains,
    addActiveChain: state.addActiveChain,
    removeActiveChain: state.removeActiveChain,
    setAvailableRoutes: state.setAvailableRoutes,
    setActiveRouteExecution: state.setActiveRouteExecution,
    updateRouteExecution: state.updateRouteExecution,
    setLastBalanceUpdate: state.setLastBalanceUpdate,
  }));

export const useAI = () =>
  useAppStore((state) => ({
    currentSession: state.currentSession,
    sessions: state.sessions,
    isProcessing: state.isProcessing,
    currentIntent: state.currentIntent,
    suggestions: state.suggestions,
    walletContext: state.walletContext,
    createSession: state.createSession,
    setCurrentSession: state.setCurrentSession,
    addMessage: state.addMessage,
    updateMessage: state.updateMessage,
    setProcessing: state.setProcessing,
    setCurrentIntent: state.setCurrentIntent,
    setSuggestions: state.setSuggestions,
    addSuggestion: state.addSuggestion,
    removeSuggestion: state.removeSuggestion,
    setWalletContext: state.setWalletContext,
    clearSession: state.clearSession,
  }));

export const useUI = () =>
  useAppStore((state) => ({
    modals: state.modals,
    toasts: state.toasts,
    isLoading: state.isLoading,
    loadingMessage: state.loadingMessage,
    sidebarOpen: state.sidebarOpen,
    theme: state.theme,
    openModal: state.openModal,
    closeModal: state.closeModal,
    closeAllModals: state.closeAllModals,
    showToast: state.showToast,
    removeToast: state.removeToast,
    clearToasts: state.clearToasts,
    setLoading: state.setLoading,
    setSidebarOpen: state.setSidebarOpen,
    toggleSidebar: state.toggleSidebar,
    setTheme: state.setTheme,
  }));

// Export all types
export type { AuthSlice } from './auth.slice';
export type { WalletSlice } from './wallet.slice';
export type { TransactionsSlice } from './transactions.slice';
export type { ContactsSlice } from './contacts.slice';
export type { PaymentLinksSlice } from './payment-links.slice';
export type { MultiChainSlice } from './multi-chain.slice';
export type { AISlice } from './ai.slice';
export type { UISlice, Toast, Modal } from './ui.slice';

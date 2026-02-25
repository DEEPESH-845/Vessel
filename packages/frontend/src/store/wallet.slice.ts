/**
 * Wallet Slice
 * Manages wallet state, session keys, and wallet operations
 */

import { StateCreator } from 'zustand';
import { CreatedWallet, SessionKey } from '@/types/wallet.types';

/**
 * Pending Payment for payment flow
 */
export interface PendingPayment {
  name: string;
  address: string;
  amount: number;
  token: string;
  avatar?: string;
  verified?: boolean;
}

export interface WalletSlice {
  // State
  wallet: CreatedWallet | null;
  sessionKeys: SessionKey[];
  isDeploying: boolean;
  deploymentTxHash: string | null;
  pendingPayment: PendingPayment | null;

  // Actions
  setWallet: (wallet: CreatedWallet) => void;
  clearWallet: () => void;
  addSessionKey: (sessionKey: SessionKey) => void;
  removeSessionKey: (publicKey: string) => void;
  updateSessionKey: (publicKey: string, updates: Partial<SessionKey>) => void;
  clearExpiredSessionKeys: () => void;
  setDeploying: (isDeploying: boolean, txHash?: string) => void;
  setPendingPayment: (payment: PendingPayment | null) => void;
  updatePendingAmount: (amount: number) => void;
  clearPendingPayment: () => void;
}

export const createWalletSlice: StateCreator<WalletSlice> = (set) => ({
  // Initial state
  wallet: null,
  sessionKeys: [],
  isDeploying: false,
  deploymentTxHash: null,
  pendingPayment: null,

  // Actions
  setWallet: (wallet) => set({ wallet }),

  clearWallet: () =>
    set({
      wallet: null,
      sessionKeys: [],
      isDeploying: false,
      deploymentTxHash: null,
      pendingPayment: null,
    }),

  addSessionKey: (sessionKey) =>
    set((state) => ({
      sessionKeys: [...state.sessionKeys, sessionKey],
    })),

  removeSessionKey: (publicKey) =>
    set((state) => ({
      sessionKeys: state.sessionKeys.filter((key) => key.publicKey !== publicKey),
    })),

  updateSessionKey: (publicKey, updates) =>
    set((state) => ({
      sessionKeys: state.sessionKeys.map((key) =>
        key.publicKey === publicKey ? { ...key, ...updates } : key
      ),
    })),

  clearExpiredSessionKeys: () =>
    set((state) => {
      const now = Date.now();
      return {
        sessionKeys: state.sessionKeys.filter((key) => key.expiresAt > now),
      };
    }),

  setDeploying: (isDeploying, txHash) =>
    set({
      isDeploying,
      deploymentTxHash: txHash || null,
    }),

  setPendingPayment: (payment) => set({ pendingPayment: payment }),

  updatePendingAmount: (amount) =>
    set((state) => ({
      pendingPayment: state.pendingPayment
        ? { ...state.pendingPayment, amount }
        : null,
    })),

  clearPendingPayment: () => set({ pendingPayment: null }),
});

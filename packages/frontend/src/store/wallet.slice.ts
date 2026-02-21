/**
 * Wallet Slice
 * Manages wallet state, session keys, and wallet operations
 */

import { StateCreator } from 'zustand';
import { CreatedWallet, SessionKey } from '@/types/wallet.types';

export interface WalletSlice {
  // State
  wallet: CreatedWallet | null;
  sessionKeys: SessionKey[];
  isDeploying: boolean;
  deploymentTxHash: string | null;

  // Actions
  setWallet: (wallet: CreatedWallet) => void;
  clearWallet: () => void;
  addSessionKey: (sessionKey: SessionKey) => void;
  removeSessionKey: (publicKey: string) => void;
  updateSessionKey: (publicKey: string, updates: Partial<SessionKey>) => void;
  clearExpiredSessionKeys: () => void;
  setDeploying: (isDeploying: boolean, txHash?: string) => void;
}

export const createWalletSlice: StateCreator<WalletSlice> = (set) => ({
  // Initial state
  wallet: null,
  sessionKeys: [],
  isDeploying: false,
  deploymentTxHash: null,

  // Actions
  setWallet: (wallet) => set({ wallet }),

  clearWallet: () =>
    set({
      wallet: null,
      sessionKeys: [],
      isDeploying: false,
      deploymentTxHash: null,
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
});

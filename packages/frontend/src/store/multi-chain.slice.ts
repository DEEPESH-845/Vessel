/**
 * Multi-Chain Slice
 * Manages multi-chain balance aggregation, cross-chain routing, and asset dashboard
 */

import { StateCreator } from 'zustand';
import {
  AssetDashboard,
  UnifiedAsset,
  ChainRoute,
  RouteExecution,
} from '@/types/multi-chain.types';

export interface MultiChainSlice {
  // State
  assetDashboard: AssetDashboard | null;
  isLoadingBalances: boolean;
  activeChains: number[];
  availableRoutes: ChainRoute[];
  activeRouteExecution: RouteExecution | null;
  lastBalanceUpdate: Date | null;

  // Actions
  setAssetDashboard: (dashboard: AssetDashboard) => void;
  updateAssets: (assets: UnifiedAsset[]) => void;
  setLoadingBalances: (loading: boolean) => void;
  setActiveChains: (chains: number[]) => void;
  addActiveChain: (chainId: number) => void;
  removeActiveChain: (chainId: number) => void;
  setAvailableRoutes: (routes: ChainRoute[]) => void;
  setActiveRouteExecution: (execution: RouteExecution | null) => void;
  updateRouteExecution: (updates: Partial<RouteExecution>) => void;
  setLastBalanceUpdate: (date: Date) => void;
}

export const createMultiChainSlice: StateCreator<MultiChainSlice> = (set) => ({
  // Initial state
  assetDashboard: null,
  isLoadingBalances: false,
  activeChains: [1, 137, 42161, 8453], // Ethereum, Polygon, Arbitrum, Base
  availableRoutes: [],
  activeRouteExecution: null,
  lastBalanceUpdate: null,

  // Actions
  setAssetDashboard: (dashboard) =>
    set({
      assetDashboard: dashboard,
      lastBalanceUpdate: new Date(),
    }),

  updateAssets: (assets) =>
    set((state) => {
      if (!state.assetDashboard) return state;

      const tokens = assets.filter((a) => a.type === 'token');
      const nfts = assets.filter((a) => a.type === 'nft');
      const defiPositions = assets.filter((a) => a.type === 'defi-position');

      const totalValue = assets
        .reduce((sum, asset) => sum + parseFloat(asset.value), 0)
        .toString();

      return {
        assetDashboard: {
          ...state.assetDashboard,
          totalValue,
          tokens,
          nfts,
          defiPositions,
          lastUpdated: new Date(),
        },
      };
    }),

  setLoadingBalances: (loading) => set({ isLoadingBalances: loading }),

  setActiveChains: (chains) => set({ activeChains: chains }),

  addActiveChain: (chainId) =>
    set((state) => ({
      activeChains: state.activeChains.includes(chainId)
        ? state.activeChains
        : [...state.activeChains, chainId],
    })),

  removeActiveChain: (chainId) =>
    set((state) => ({
      activeChains: state.activeChains.filter((id) => id !== chainId),
    })),

  setAvailableRoutes: (routes) => set({ availableRoutes: routes }),

  setActiveRouteExecution: (execution) => set({ activeRouteExecution: execution }),

  updateRouteExecution: (updates) =>
    set((state) => ({
      activeRouteExecution: state.activeRouteExecution
        ? { ...state.activeRouteExecution, ...updates }
        : null,
    })),

  setLastBalanceUpdate: (date) => set({ lastBalanceUpdate: date }),
});

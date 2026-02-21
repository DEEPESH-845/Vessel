/**
 * UnifiedAssetDashboard Component
 * Main container for multi-chain asset aggregation dashboard
 * Requirements: FR-11.2
 */

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MultiChainBalanceCard from "./multi-chain-balance-card";
import TokenList from "./token-list";
import NFTGrid from "./nft-grid";
import DeFiPositionsList from "./defi-positions-list";
import PendingTransactionsBanner from "./pending-transactions-banner";
import { aggregateMultiChainBalances } from "@/services/multi-chain/chain-aggregator.service";
import { AssetDashboard, UnifiedAsset } from "@/types/multi-chain.types";

interface UnifiedAssetDashboardProps {
  address: string;
  chains?: number[];
}

export default function UnifiedAssetDashboard({
  address,
  chains = [1, 137, 42161, 8453], // Ethereum, Polygon, Arbitrum, Base
}: UnifiedAssetDashboardProps) {
  const [dashboard, setDashboard] = useState<AssetDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch balances
  const fetchBalances = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const data = await aggregateMultiChainBalances(address, chains);
      setDashboard(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching balances:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch balances");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBalances();
  }, [address, chains.join(",")]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBalances();
    }, 30000);

    return () => clearInterval(interval);
  }, [address, chains.join(",")]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchBalances(true);
  };

  // Loading state
  if (isLoading && !dashboard) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <div className="p-6 rounded-2xl" style={{ background: "#18181B", border: "1px solid #27272A" }}>
        <p className="text-red-400">Error: {error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 rounded-lg"
          style={{ background: "#CCFF00", color: "#0A0A0A" }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (dashboard && parseFloat(dashboard.totalValue) === 0) {
    return (
      <div className="space-y-6">
        <MultiChainBalanceCard
          totalValue="0"
          chainBreakdown={[]}
          isLoading={false}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
        />
        <EmptyState />
      </div>
    );
  }

  // Calculate chain breakdown
  const chainBreakdown = calculateChainBreakdown(dashboard);

  // Handle send action - Navigate to pay page with asset pre-filled
  const handleSend = (asset: UnifiedAsset) => {
    const params = new URLSearchParams({
      asset: asset.metadata.address || 'native',
      chain: asset.chainId.toString(),
      amount: asset.metadata.balance || '0',
    });
    window.location.href = `/pay?${params.toString()}`;
  };

  // Handle swap action - Navigate to swap page (would integrate with DEX)
  const handleSwap = (asset: UnifiedAsset) => {
    const params = new URLSearchParams({
      fromAsset: asset.metadata.address || 'native',
      fromChain: asset.chainId.toString(),
    });
    window.location.href = `/swap?${params.toString()}`;
  };

  // Handle claim rewards - Would trigger claim transaction
  const handleClaim = async (position: UnifiedAsset) => {
    try {
      // In production, this would:
      // 1. Build the claim transaction for the specific DeFi protocol
      // 2. Submit via meta-transaction service
      // 3. Show pending state
      console.log('Claiming rewards for position:', position);
      alert(`Claiming ${position.metadata.claimable || '0'} ${position.metadata.deposited ? 'rewards' : 'tokens'} from ${position.metadata.protocol}`);
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      alert('Failed to claim rewards. Please try again.');
    }
  };

  // Handle view protocol - Navigate to protocol dashboard
  const handleViewProtocol = (position: UnifiedAsset) => {
    const protocol = position.metadata.protocol?.toLowerCase() || '';
    // Map protocol names to their dashboard URLs
    const protocolUrls: Record<string, string> = {
      aave: 'https://app.aave.com',
      compound: 'https://app.compound.finance',
      uniswap: 'https://app.uniswap.org',
      'uniswap v3': 'https://app.uniswap.org',
    };
    
    const dashboardUrl = protocolUrls[protocol];
    if (dashboardUrl) {
      window.open(dashboardUrl, '_blank');
    } else {
      // Fallback to generic DeFi positions page
      window.location.href = '/wallet?tab=defi';
    }
  };

  // Handle cancel transaction - Would send replacement transaction with higher gas
  const handleCancelTransaction = async (hash: string) => {
    try {
      // In production, this would:
      // 1. Query the pending transaction details
      // 2. Send a replacement transaction with same nonce but higher gas
      // 3. This effectively cancels the original transaction
      console.log('Cancelling transaction:', hash);
      alert('Transaction cancellation would replace the transaction with a higher gas fee. This feature requires wallet connection.');
    } catch (error) {
      console.error('Failed to cancel transaction:', error);
      alert('Failed to cancel transaction. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Pending Transactions Banner */}
      {dashboard && dashboard.pendingTransactions && dashboard.pendingTransactions.length > 0 && (
        <PendingTransactionsBanner
          pendingTransactions={dashboard.pendingTransactions}
          onCancel={handleCancelTransaction}
        />
      )}

      <MultiChainBalanceCard
        totalValue={dashboard?.totalValue || "0"}
        chainBreakdown={chainBreakdown}
        isLoading={false}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
      />

      {/* Token List */}
      {dashboard && dashboard.tokens.length > 0 && (
        <TokenList
          tokens={dashboard.tokens}
          onSend={handleSend}
          onSwap={handleSwap}
        />
      )}

      {/* NFT Grid */}
      {dashboard && dashboard.nfts.length > 0 && (
        <div>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "#FFFFFF" }}
          >
            NFTs
          </h2>
          <NFTGrid nfts={dashboard.nfts} />
        </div>
      )}

      {/* DeFi Positions */}
      {dashboard && dashboard.defiPositions.length > 0 && (
        <DeFiPositionsList
          positions={dashboard.defiPositions}
          onClaim={handleClaim}
          onViewProtocol={handleViewProtocol}
        />
      )}
    </motion.div>
  );
}

/**
 * Calculate chain breakdown from dashboard data
 */
function calculateChainBreakdown(dashboard: AssetDashboard | null) {
  if (!dashboard) return [];

  const chainMap = new Map<string, { chainId: number; value: number }>();

  // Aggregate values by chain
  [...dashboard.tokens, ...dashboard.nfts, ...dashboard.defiPositions].forEach((asset) => {
    const current = chainMap.get(asset.chain) || { chainId: asset.chainId, value: 0 };
    chainMap.set(asset.chain, {
      chainId: asset.chainId,
      value: current.value + parseFloat(asset.value),
    });
  });

  // Convert to array and sort by value
  return Array.from(chainMap.entries())
    .map(([chain, data]) => ({
      chain,
      chainId: data.chainId,
      value: data.value.toFixed(2),
    }))
    .sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
}

/**
 * Loading skeleton
 */
function LoadingSkeleton() {
  return (
    <div
      className="p-6 rounded-2xl animate-pulse"
      style={{ background: "#18181B", border: "1px solid #27272A" }}
    >
      <div className="h-4 w-32 bg-gray-700 rounded mb-4" />
      <div className="h-12 w-48 bg-gray-700 rounded mb-6" />
      <div className="space-y-3">
        <div className="h-16 bg-gray-700 rounded" />
        <div className="h-16 bg-gray-700 rounded" />
        <div className="h-16 bg-gray-700 rounded" />
      </div>
    </div>
  );
}

/**
 * Empty state
 */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="p-12 rounded-2xl text-center"
      style={{ background: "#18181B", border: "1px solid #27272A" }}
    >
      <div className="mb-4">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          className="mx-auto opacity-50"
        >
          <circle cx="32" cy="32" r="30" stroke="#27272A" strokeWidth="2" />
          <path
            d="M32 20v24M20 32h24"
            stroke="#CCFF00"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: "#FFFFFF" }}>
        No Assets Found
      </h3>
      <p className="text-sm" style={{ color: "#71717A" }}>
        Your wallet doesn't have any assets yet. Start by adding funds to your wallet.
      </p>
    </motion.div>
  );
}

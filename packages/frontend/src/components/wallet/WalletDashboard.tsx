'use client';

/**
 * WalletDashboard Component
 * Main wallet interface with swap, balance, and transaction functionality
 * Connected to Zustand store and backend services per ARCHITECTURE.md
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet, useTransactions, useAuth, useMultiChain, useUI } from '@/store';
import { staggerContainer, staggerItem, fadeUp, pageTransition } from '@/lib/animations';
import { sessionKeyService } from '@/services/session-key.service';
import { ensResolverService } from '@/services/ens-resolver.service';
import { multiChainRouterService } from '@/services/multi-chain-router.service';
import { paymasterService } from '@/services/paymaster.service';

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const SwapIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const KeyIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

type TabType = 'swap' | 'wallet' | 'history' | 'settings' | 'keys';

// Token options for swap
const TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
];

export function WalletDashboard() {
  // Zustand store hooks
  const { wallet, sessionKeys, addSessionKey, removeSessionKey } = useWallet();
  const { transactions, pendingTransactions, addTransaction } = useTransactions();
  const { user, isAuthenticated } = useAuth();
  const { assetDashboard, setAssetDashboard } = useMultiChain();
  const { showToast } = useUI();

  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('swap');
  const [swapFrom, setSwapFrom] = useState({ symbol: 'USDC', amount: '' });
  const [swapTo, setSwapTo] = useState({ symbol: 'USDT', amount: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [swapQuote, setSwapQuote] = useState<{ rate: number; fee: string } | null>(null);

  // Get wallet address
  const walletAddress = wallet?.address || user?.walletAddress;

  // Resolve ENS name for wallet address
  useEffect(() => {
    if (walletAddress) {
      ensResolverService.lookupAddress(walletAddress, 1).then((name) => {
        if (name) {
          setEnsName(name);
        }
      }).catch(console.error);
    }
  }, [walletAddress]);

  // Calculate total balance from asset dashboard
  const totalBalance = parseFloat(assetDashboard?.totalValue || '0');

  // Format address for display
  const displayAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : 'Not Connected';

  // Handle swap direction toggle
  const handleSwapDirection = useCallback(() => {
    const temp = swapFrom;
    setSwapFrom(swapTo);
    setSwapTo(temp);
    setSwapQuote(null);
  }, [swapFrom, swapTo]);

  // Get swap quote from multi-chain router
  const getSwapQuote = useCallback(async () => {
    if (!swapFrom.amount || parseFloat(swapFrom.amount) <= 0) return;

    setIsLoading(true);
    try {
      const fromToken = TOKENS.find(t => t.symbol === swapFrom.symbol);
      const toToken = TOKENS.find(t => t.symbol === swapTo.symbol);
      
      if (!fromToken || !toToken) return;

      // In production, this would call the actual DEX aggregator
      // For now, use a simulated 1:1 rate with small fee
      const amount = parseFloat(swapFrom.amount);
      const rate = 0.998; // 0.2% fee
      const outputAmount = amount * rate;
      
      setSwapQuote({
        rate,
        fee: `${(amount * 0.002).toFixed(4)} ${swapFrom.symbol}`
      });
      
      setSwapTo(prev => ({ ...prev, amount: outputAmount.toFixed(2) }));
    } catch (error) {
      console.error('Failed to get quote:', error);
      showToast({
        type: 'error',
        title: 'Swap Error',
        message: 'Failed to get swap quote',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [swapFrom, swapTo, showToast]);

  // Execute swap
  const handleSwap = useCallback(async () => {
    if (!walletAddress || !swapFrom.amount) {
      showToast({
        type: 'error',
        title: 'Swap Error',
        message: 'Please connect wallet and enter amount',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      // In production, this would:
      // 1. Build UserOperation with swap calldata
      // 2. Get paymaster signature for gasless tx
      // 3. Submit through bundler
      
      // Simulate swap execution
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add transaction to history
      addTransaction({
        id: `tx-${Date.now()}`,
        hash: `0x${Math.random().toString(16).slice(2)}`,
        type: 'swap',
        from: walletAddress || '0x0',
        to: '0x0', // DEX router address
        value: swapFrom.amount,
        token: swapFrom.symbol,
        chainId: 1, // Ethereum mainnet
        status: 'completed',
        timestamp: new Date(),
        metadata: {
          isMetaTx: true,
          usedSessionKey: true,
          swapProtocol: 'internal',
        },
      });

      showToast({
        type: 'success',
        title: 'Swap Complete',
        message: `Swapped ${swapFrom.amount} ${swapFrom.symbol} for ${swapTo.amount} ${swapTo.symbol}`,
        duration: 5000,
      });

      // Reset form
      setSwapFrom(prev => ({ ...prev, amount: '' }));
      setSwapTo(prev => ({ ...prev, amount: '' }));
      setSwapQuote(null);
    } catch (error) {
      console.error('Swap failed:', error);
      showToast({
        type: 'error',
        title: 'Swap Failed',
        message: 'Swap failed. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, swapFrom, swapTo, addTransaction, showToast]);

  // Create new session key
  const handleCreateSessionKey = useCallback(async () => {
    if (!user?.id) {
      showToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please login to create session keys',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const sessionKey = await sessionKeyService.createSessionKey(
        {
          spendingLimit: '1000000000000000000', // 1 ETH max
          chainIds: [1, 137], // Ethereum + Polygon
        },
        7 * 24 * 60 * 60 * 1000 // 7 days
      );

      addSessionKey(sessionKey);

      showToast({
        type: 'success',
        title: 'Session Key Created',
        message: 'Session key created successfully',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to create session key:', error);
      showToast({
        type: 'error',
        title: 'Session Key Error',
        message: 'Failed to create session key',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, addSessionKey, showToast]);

  // Revoke session key
  const handleRevokeSessionKey = useCallback(async (publicKey: string) => {
    setIsLoading(true);
    try {
      await sessionKeyService.revokeSessionKey(publicKey);
      removeSessionKey(publicKey);

      showToast({
        type: 'success',
        title: 'Key Revoked',
        message: 'Session key revoked',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to revoke session key:', error);
      showToast({
        type: 'error',
        title: 'Revoke Failed',
        message: 'Failed to revoke session key',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [removeSessionKey, showToast]);

  // Get quote when amount changes
  useEffect(() => {
    if (swapFrom.amount && parseFloat(swapFrom.amount) > 0) {
      const timeoutId = setTimeout(getSwapQuote, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [swapFrom.amount, getSwapQuote]);

  return (
    <div className="min-h-screen bg-[#060b14] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#060b14]/90 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left - Back + Logo */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeftIcon />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                  <path d="M12 2L8 8H4L12 22L20 8H16L12 2Z" />
                </svg>
              </div>
              <span className="font-semibold text-white hidden sm:block">Vessel</span>
            </Link>
          </div>

          {/* Center - Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">
              {isAuthenticated ? 'Connected' : 'Guest Mode'}
            </span>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/activity"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <HistoryIcon />
            </Link>
            <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <SettingsIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-white/50 mb-1">Total Balance</p>
                  <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  {ensName && (
                    <p className="text-sm text-blue-400 mt-1">{ensName}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">{displayAddress}</p>
                  <div className="flex items-center gap-1 text-sm text-green-400 mt-1">
                    <span>+$0.00</span>
                    <span className="text-white/30">•</span>
                    <span className="text-white/50">Today</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tab Navigation - Mobile */}
            <div className="flex lg:hidden overflow-x-auto gap-2 pb-2">
              {[
                { id: 'swap' as TabType, label: 'Swap', icon: <SwapIcon /> },
                { id: 'wallet' as TabType, label: 'Wallet', icon: <WalletIcon /> },
                { id: 'history' as TabType, label: 'History', icon: <HistoryIcon /> },
                { id: 'keys' as TabType, label: 'Keys', icon: <KeyIcon /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {tab.icon}
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              {/* Swap Panel */}
              <motion.div
                key="swap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`${activeTab !== 'swap' ? 'hidden lg:block' : ''}`}
              >
                  <div className="p-6 rounded-2xl bg-[#0b1422] border border-white/[0.05]">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Swap</h3>
                    
                    {/* From */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-white/40 uppercase tracking-wider">From</span>
                        <select
                          value={swapFrom.symbol}
                          onChange={(e) => setSwapFrom(prev => ({ ...prev, symbol: e.target.value }))}
                          className="bg-transparent text-sm text-white border-none outline-none cursor-pointer"
                        >
                          {TOKENS.map(token => (
                            <option key={token.symbol} value={token.symbol} className="bg-[#0b1422]">
                              {token.symbol}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={swapFrom.amount}
                        onChange={(e) => setSwapFrom({ ...swapFrom, amount: e.target.value })}
                        className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-white/20"
                      />
                    </div>

                    {/* Swap Direction Button */}
                    <div className="flex justify-center -my-1 relative z-10">
                      <button
                        onClick={handleSwapDirection}
                        className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                      >
                        <SwapIcon />
                      </button>
                    </div>

                    {/* To */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-white/40 uppercase tracking-wider">To</span>
                        <select
                          value={swapTo.symbol}
                          onChange={(e) => setSwapTo(prev => ({ ...prev, symbol: e.target.value }))}
                          className="bg-transparent text-sm text-white border-none outline-none cursor-pointer"
                        >
                          {TOKENS.map(token => (
                            <option key={token.symbol} value={token.symbol} className="bg-[#0b1422]">
                              {token.symbol}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={swapTo.amount}
                        readOnly
                        className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-white/20"
                      />
                    </div>

                    {/* Quote Info */}
                    {swapQuote && (
                      <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/50">Rate</span>
                          <span className="text-white">1 {swapFrom.symbol} ≈ {swapQuote.rate} {swapTo.symbol}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-white/50">Fee</span>
                          <span className="text-white">{swapQuote.fee}</span>
                        </div>
                      </div>
                    )}

                    {/* Swap Button */}
                    <button
                      onClick={handleSwap}
                      disabled={!swapFrom.amount || isLoading || !isAuthenticated}
                      className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all ${
                        isLoading || !swapFrom.amount || !isAuthenticated
                          ? 'bg-white/10 text-white/40 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isLoading ? 'Processing...' : isAuthenticated ? 'Swap Now' : 'Login to Swap'}
                    </button>
                  </div>
                </motion.div>

              {/* Wallet / Assets Panel */}
              <motion.div
                key="wallet"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`${activeTab !== 'wallet' ? 'hidden lg:block' : ''}`}
              >
                  <div className="p-6 rounded-2xl bg-[#0b1422] border border-white/[0.05]">
                    <h3 className="text-lg font-semibold text-white mb-4">Your Assets</h3>
                    <div className="space-y-3">
                      {assetDashboard?.tokens?.filter(t => t.type === 'token').map((asset) => {
                        const meta = asset.metadata as import('@/types/multi-chain.types').TokenMetadata;
                        return (
                          <div
                            key={meta.symbol}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold text-sm">
                                {meta.symbol.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{meta.symbol}</p>
                                <p className="text-xs text-white/40">{meta.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-white">{meta.balance}</p>
                              <p className="text-xs text-white/50">${(parseFloat(meta.balance) * meta.price).toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      }) || (
                        <div className="text-center py-8 text-white/40">
                          <p>No assets found</p>
                          <p className="text-xs mt-1">Connect wallet to view balances</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

              {/* History Panel */}
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`${activeTab !== 'history' ? 'hidden lg:block' : ''}`}
              >
                  <div className="p-6 rounded-2xl bg-[#0b1422] border border-white/[0.05]">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                      <Link
                        href="/activity"
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {transactions.slice(0, 5).map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === 'receive' ? 'bg-green-500/20 text-green-400' :
                              tx.type === 'send' ? 'bg-red-500/20 text-red-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {tx.type === 'receive' ? '↓' : tx.type === 'send' ? '↑' : '↔'}
                            </div>
                            <div>
                              <p className="text-sm text-white capitalize">{tx.type}</p>
                              <p className="text-xs text-white/40">
                                {new Date(tx.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              tx.type === 'receive' ? 'text-green-400' : 
                              tx.type === 'send' ? 'text-red-400' : 
                              'text-white'
                            }`}>
                              {tx.value} {tx.token || ''}
                            </p>
                            <p className="text-xs text-white/40">
                              {tx.status === 'completed' ? '✓ Completed' : 'Pending...'}
                            </p>
                          </div>
                        </div>
                      ))}
                      {transactions.length === 0 && (
                        <div className="text-center py-8 text-white/40">
                          <p>No transactions yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

              {/* Session Keys Panel */}
              {activeTab === 'keys' && (
                <motion.div
                  key="keys"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="p-6 rounded-2xl bg-[#0b1422] border border-white/[0.05]">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">Session Keys</h3>
                      <button
                        onClick={handleCreateSessionKey}
                        disabled={isLoading || !isAuthenticated}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isLoading || !isAuthenticated
                            ? 'bg-white/5 text-white/40 cursor-not-allowed'
                            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        }`}
                      >
                        + New Key
                      </button>
                    </div>
                    <p className="text-xs text-white/50 mb-4">
                      Session keys allow gasless transactions with limited permissions.
                    </p>
                    <div className="space-y-2">
                      {sessionKeys.map((key) => {
                        const remainingTime = sessionKeyService.getRemainingTime(key);
                        const isExpired = sessionKeyService.isExpired(key);
                        
                        return (
                          <div
                            key={key.publicKey}
                            className={`p-3 rounded-xl border ${
                              isExpired 
                                ? 'bg-red-500/5 border-red-500/20' 
                                : 'bg-white/[0.02] border-white/[0.05]'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-white font-mono">
                                  {key.publicKey.slice(0, 10)}...{key.publicKey.slice(-8)}
                                </p>
                                <div className="flex gap-2 mt-1">
                                  {key.permissions.spendingLimit && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                      Limit: {parseFloat(key.permissions.spendingLimit) / 1e18} ETH
                                    </span>
                                  )}
                                  {key.permissions.chainIds && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                                      {key.permissions.chainIds.length} chains
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-xs ${isExpired ? 'text-red-400' : 'text-white/50'}`}>
                                  {isExpired ? 'Expired' : `${Math.floor(remainingTime / 3600000)}h remaining`}
                                </p>
                                {!isExpired && (
                                  <button
                                    onClick={() => handleRevokeSessionKey(key.publicKey)}
                                    className="text-xs text-red-400 hover:text-red-300 mt-1"
                                  >
                                    Revoke
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {sessionKeys.length === 0 && (
                        <div className="text-center py-8 text-white/40">
                          <p>No session keys</p>
                          <p className="text-xs mt-1">Create one for gasless transactions</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="hidden lg:block space-y-6">
            {/* Quick Actions */}
            <div className="p-6 rounded-2xl bg-[#0b1422] border border-white/[0.05]">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/pay"
                  className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="text-xs font-medium">Send</span>
                </Link>
                <button className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors">
                  <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs font-medium">Receive</span>
                </button>
                <Link
                  href="/scan"
                  className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors"
                >
                  <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium">QR Pay</span>
                </Link>
                <button 
                  onClick={() => setActiveTab('swap')}
                  className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors"
                >
                  <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="text-xs font-medium">Swap</span>
                </button>
              </div>
            </div>

            {/* Network Info */}
            <div className="p-6 rounded-2xl bg-[#0b1422] border border-white/[0.05]">
              <h3 className="text-lg font-semibold text-white mb-4">Network</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-white/50">Network</span>
                  <span className="text-sm text-white">Lisk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/50">Gas Price</span>
                  <span className="text-sm text-green-400">Sponsored</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/50">Status</span>
                  <span className="flex items-center gap-1 text-sm text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Healthy
                  </span>
                </div>
              </div>
            </div>

            {/* Session Keys Summary */}
            <div className="p-6 rounded-2xl bg-[#0b1422] border border-white/[0.05]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Session Keys</h3>
                <button
                  onClick={() => setActiveTab('keys')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Manage
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Active Keys</span>
                <span className="text-sm text-white">
                  {sessionKeys.filter(k => !sessionKeyService.isExpired(k)).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#060b14]/95 backdrop-blur-xl border-t border-white/[0.05] z-50">
        <div className="flex items-center justify-around h-16">
          {[
            { id: 'swap' as TabType, label: 'Swap', icon: <SwapIcon /> },
            { id: 'wallet' as TabType, label: 'Wallet', icon: <WalletIcon /> },
            { id: 'history' as TabType, label: 'History', icon: <HistoryIcon /> },
            { id: 'keys' as TabType, label: 'Keys', icon: <KeyIcon /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 ${
                activeTab === tab.id ? 'text-blue-400' : 'text-white/40'
              }`}
            >
              {tab.icon}
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default WalletDashboard;
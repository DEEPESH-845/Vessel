'use client';

/**
 * Dashboard Page
 * Comprehensive crypto payment dashboard with analytics
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StatsCards } from './_components/stats-cards';
import { PortfolioChart } from './_components/portfolio-chart';
import { AssetsTable } from './_components/assets-table';
import { TradingPanel } from './_components/trading-panel';

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#060b14] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b14] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#060b14]/90 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left - Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <MenuIcon />
            </button>
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

          {/* Center - Title */}
          <h1 className="text-lg font-semibold text-white hidden md:block">Payment Dashboard</h1>

          {/* Right - Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Connected</span>
            </div>
            <Link
              href="/wallet"
              className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              }}
            >
              Launch Wallet
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Stats Cards */}
          <StatsCards />
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Chart & Assets */}
          <div className="xl:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <PortfolioChart />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <AssetsTable />
            </motion.div>
          </div>

          {/* Right Column - Trading Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden xl:block"
          >
            <TradingPanel />
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 xl:hidden bg-[#060b14]/95 backdrop-blur-xl border-t border-white/[0.05] z-50">
        <div className="flex items-center justify-around h-16">
          {[
            { href: '/dashboard', label: 'Dashboard', active: true },
            { href: '/wallet', label: 'Wallet' },
            { href: '/activity', label: 'Activity' },
            { href: '/scan', label: 'Scan' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 ${
                item.active ? 'text-blue-400' : 'text-white/40'
              }`}
            >
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
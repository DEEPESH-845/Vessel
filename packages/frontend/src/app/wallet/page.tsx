'use client';

/**
 * Wallet Page - Responsive swap dashboard
 * Works on all screen sizes with adaptive layout
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import heavy components
const WalletDashboard = dynamic(
  () => import('@/components/wallet/WalletDashboard').then((mod) => mod.WalletDashboard),
  { 
    ssr: false,
    loading: () => <LoadingState />
  }
);

function LoadingState() {
  return (
    <div 
      className="flex items-center justify-center min-h-screen"
      style={{ background: '#060b14' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent"
        />
        <p className="text-sm text-white/50">Loading wallet...</p>
      </motion.div>
    </div>
  );
}

export default function WalletPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingState />;
  }

  return <WalletDashboard />;
}
'use client';

/**
 * PromoCodeModal - Floating promo overlay
 * Centered modal with promo code input
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, MoreVertical } from 'lucide-react';

interface PromoCodeModalProps {
  className?: string;
}

export function PromoCodeModal({ className = '' }: PromoCodeModalProps) {
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 ${className}`}
      style={{
        width: '380px',
        background: 'rgba(11, 20, 34, 0.95)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(59, 130, 246, 0.12)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
      }}
    >
      {/* More menu */}
      <button className="absolute top-4 right-4 text-[#6b7fa3] hover:text-white">
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Content */}
      <h3 className="text-[22px] font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
        Have a<br />promocode?
      </h3>
      <p className="text-[13px] text-[#6b7fa3] leading-relaxed mb-4">
        Enter code and it apply<br />automatically (optional)
      </p>

      {/* Input */}
      <div
        className="mb-4 rounded-lg overflow-hidden"
        style={{
          background: '#060b14',
          border: '1px solid rgba(59, 130, 246, 0.12)',
        }}
      >
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="enter *** here"
          className="w-full bg-transparent text-white px-4 py-3 outline-none text-sm"
        />
      </div>

      {/* Refresh button */}
      <div className="flex items-center gap-3">
        <button
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: '#101c2e',
            border: '1px solid rgba(59, 130, 246, 0.4)',
          }}
        >
          <RefreshCw className="w-6 h-6 text-[#22d3ee]" />
        </button>
        <span className="text-[13px] text-[#6b7fa3]">Update {countdown} sec</span>
      </div>
    </motion.div>
  );
}
'use client';

/**
 * VolumeCard - Volume display with bar chart
 * Shows Uniswap volume with animated bars
 */

import { motion } from 'framer-motion';

interface VolumeCardProps {
  className?: string;
}

const volumeData = [45, 72, 58, 85, 65, 78];
const labels = ['Jan12', 'Feb18', 'Mar24', 'Apr15', 'May22', 'Jul27'];

export function VolumeCard({ className = '' }: VolumeCardProps) {
  const maxValue = Math.max(...volumeData);

  return (
    <div
      className={`absolute bottom-8 right-[320px] z-10 ${className}`}
      style={{
        width: '260px',
        background: 'rgba(11, 20, 34, 0.82)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(59, 130, 246, 0.12)',
        borderRadius: '20px',
        padding: '16px',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-[#101c2e] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M12 4L6 10H18L12 4Z" fill="#3b82f6" />
            <path d="M12 20L6 14H18L12 20Z" fill="#3b82f6" opacity="0.5" />
          </svg>
        </div>
        <div>
          <span className="text-xs text-[#6b7fa3]">Uniswap volume</span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-mono font-bold text-white">$42.99B</span>
            <span className="text-xs text-[#6b7fa3]">Past month</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-16 mt-4">
        {volumeData.map((value, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(value / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
              className="w-full rounded-t"
              style={{
                background: 'linear-gradient(180deg, #3b82f6 0%, #22d3ee 100%)',
                minHeight: '4px',
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Labels */}
      <div className="flex justify-between mt-2">
        {labels.map((label, i) => (
          <span key={i} className="text-[10px] text-[#374562] font-mono flex-1 text-center">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
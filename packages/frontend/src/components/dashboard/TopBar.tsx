'use client';

/**
 * TopBar - Full-width navigation bar
 * Back nav, icon pills, light toggle
 */

import { ChevronLeft, Bell, Sun, Box, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopBarProps {
  className?: string;
}

export function TopBar({ className = '' }: TopBarProps) {
  const router = useRouter();

  return (
    <div
      className={`flex items-center justify-between px-6 ${className}`}
      style={{ height: '64px', background: 'transparent' }}
    >
      {/* Left - Back Navigation */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-[#6b7fa3] hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-[13px]">Back to Home</span>
      </button>

      {/* Center - Icon Pills */}
      <div
        className="flex items-center gap-4 px-4 py-2 rounded-full"
        style={{
          background: 'rgba(11, 20, 34, 0.82)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(59, 130, 246, 0.12)',
        }}
      >
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-[#22d3ee]" />
          <span className="text-[13px] font-mono text-white">3</span>
        </div>
        <div className="w-px h-4 bg-[rgba(59,130,246,0.12)]" />
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#22d3ee]" />
          <span className="text-[13px] font-mono text-white">65</span>
        </div>
        <div className="w-px h-4 bg-[rgba(59,130,246,0.12)]" />
        <Bell className="w-4 h-4 text-[#6b7fa3] hover:text-white cursor-pointer transition-colors" />
      </div>

      {/* Right - Next Label & Light Toggle */}
      <div className="flex items-center gap-4">
        <span className="text-[13px] text-[#6b7fa3]">
          Next: The Null <span className="ml-1">{">"}</span>
        </span>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: '#101c2e' }}
        >
          <Sun className="w-5 h-5 text-[#6b7fa3]" />
        </button>
      </div>
    </div>
  );
}
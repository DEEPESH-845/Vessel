'use client';

/**
 * Sidebar - 72px wide navigation
 * Vertical nav with icons, ETH badge, and utility icons
 */

import { Home, ArrowLeftRight, Globe, Award, BarChart3, Grid3X3, Settings } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  return (
    <div
      className={`h-full flex flex-col ${className}`}
      style={{
        width: '72px',
        background: '#0b1422',
        borderRight: '1px solid rgba(59, 130, 246, 0.12)',
      }}
    >
      {/* Brand Avatar */}
      <div className="flex justify-center pt-4 pb-6">
        <div className="w-12 h-12 rounded-full bg-[#101c2e] flex items-center justify-center">
          <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
            <path
              d="M16 4L8 10V22L16 28L24 22V10L16 4Z"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M16 10V16" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 16L12 14" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 16L20 14" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col items-center gap-1 px-2">
        <NavButton icon={<Home className="w-5 h-5" />} isActive />
        <NavButton icon={<ArrowLeftRight className="w-5 h-5" />} />
        
        {/* ETH Badge (Special) */}
        <div className="my-2 relative">
          <div
            className="w-13 h-13 rounded-full flex items-center justify-center"
            style={{
              width: '52px',
              height: '52px',
              background: '#101c2e',
              boxShadow: '0 0 0 2px #0b1422, 0 0 0 4px #14b8a6',
            }}
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#14b8a6">
              <path d="M12 1.5L5.5 12.5L12 16.5L18.5 12.5L12 1.5Z" />
              <path d="M12 18L5.5 13.5L12 22.5L18.5 13.5L12 18Z" opacity="0.6" />
            </svg>
          </div>
        </div>
        
        <NavButton icon={<Globe className="w-5 h-5" />} />
        <NavButton icon={<Award className="w-5 h-5" />} />
      </div>

      {/* Bottom Utility Icons */}
      <div className="flex flex-col items-center gap-1 px-2 pb-4">
        <NavButton icon={<BarChart3 className="w-5 h-5" />} />
        <NavButton icon={<Grid3X3 className="w-5 h-5" />} />
        <span className="text-[11px] text-[#6b7fa3] mt-2">ENG</span>
        <div className="w-8 h-px bg-[rgba(59,130,246,0.12)] my-2" />
        <NavButton icon={<Settings className="w-5 h-5" />} />
      </div>
    </div>
  );
}

function NavButton({ icon, isActive = false }: { icon: React.ReactNode; isActive?: boolean }) {
  return (
    <button
      className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all"
      style={{
        background: isActive ? '#3b82f6' : 'transparent',
        borderRadius: '12px',
      }}
    >
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 w-[3px] h-5 rounded-r"
          style={{ background: '#3b82f6' }}
        />
      )}
      <span className={isActive ? 'text-white' : 'text-[#6b7fa3] hover:text-white'}>{icon}</span>
    </button>
  );
}
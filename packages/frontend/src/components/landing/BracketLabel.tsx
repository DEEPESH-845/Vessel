'use client';

/**
 * BracketLabel Component
 * A label with corner-bracket decoration using CSS pseudo-elements
 */

import { cn } from '@/lib/utils';

interface BracketLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function BracketLabel({ children, className }: BracketLabelProps) {
  return (
    <span
      className={cn(
        'relative inline-block px-2.5 py-1 text-[13px] text-white/60',
        className
      )}
    >
      {children}
      {/* Top-left corner */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/45" />
      {/* Bottom-right corner */}
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/45" />
    </span>
  );
}
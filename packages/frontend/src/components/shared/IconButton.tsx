'use client';

/**
 * IconButton - Circular dark pill button
 * 40×40px circle with glassmorphism style
 */

import { motion } from 'framer-motion';

interface IconButtonProps {
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

export function IconButton({
  icon,
  isActive = false,
  onClick,
  className = '',
  ariaLabel,
}: IconButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={ariaLabel}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${className}`}
      style={{
        backgroundColor: isActive ? '#3b82f6' : '#101c2e',
        border: `1px solid ${isActive ? 'transparent' : 'rgba(59,130,246,0.12)'}`,
      }}
    >
      <span className={isActive ? 'text-white' : 'text-[#22d3ee]'}>
        {icon}
      </span>
    </motion.button>
  );
}
'use client';

/**
 * MagneticButton Component
 * Button with magnetic hover effect that follows cursor
 */

import { useRef, useState, useCallback, ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function MagneticButton({
  children,
  className,
  strength = 0.4,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  disabled = false,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (reducedMotion || disabled) return;
    
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    setPosition({ x: deltaX, y: deltaY });
  }, [strength, reducedMotion, disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      setIsHovered(true);
    }
  }, [disabled]);

  const baseStyles = cn(
    'relative inline-flex items-center justify-center gap-2 font-semibold',
    'transition-all duration-300 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
  );

  const variantStyles = {
    primary: cn(
      'text-white rounded-xl',
      'bg-gradient-to-r from-blue-500 to-cyan-500',
      'shadow-[0_4px_24px_rgba(59,130,246,0.4)]',
      'hover:shadow-[0_8px_32px_rgba(59,130,246,0.5)]',
      'hover:from-blue-400 hover:to-cyan-400',
      'active:scale-95'
    ),
    secondary: cn(
      'text-white rounded-xl',
      'bg-white/5 border border-white/10',
      'hover:bg-white/10 hover:border-white/20',
      'active:scale-95'
    ),
    ghost: cn(
      'text-white/70 rounded-lg',
      'bg-transparent',
      'hover:bg-white/5 hover:text-white',
      'active:scale-95'
    ),
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const combinedClassName = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  const style = reducedMotion
    ? {}
    : {
        transform: `translate(${position.x}px, ${position.y}px)${isHovered ? ' scale(1.02)' : ''}`,
        willChange: 'transform',
      };

  if (href) {
    return (
      <a
        ref={buttonRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={combinedClassName}
        style={style}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </a>
    );
  }

  return (
    <button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      className={combinedClassName}
      style={style}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      disabled={disabled}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}

export default MagneticButton;
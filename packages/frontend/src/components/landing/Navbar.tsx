'use client';

/**
 * Navbar Component - Luxury Mode
 * Fixed navigation with matte semi-transparent background
 * 
 * LUXURY DESIGN:
 * - Fixed position, no jitter
 * - Matte background (not heavy blur)
 * - Stable opacity, no flicker
 * - 72px height desktop / 64px mobile
 * - 24px mobile / 64px desktop padding
 * 
 * NO:
 * - Magnetic button effects (causes jitter)
 * - Heavy glow
 * - Opacity flicker
 * - Scroll-based transform animations
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#intro', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#benefits', label: 'Benefits' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // STABILIZED: Single boolean state, no intermediate values
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        // STABILIZED: Fixed positioning with consistent height
        'fixed top-0 left-0 right-0 z-[100]',
        // LUXURY: Height per spec - 64px mobile, 72px desktop
        'h-16 lg:h-[72px]',
        // LUXURY: Consistent padding - 24px mobile, 64px desktop
        'px-6 lg:px-16',
        // Flex layout
        'flex items-center',
        // STABILIZED: No GPU transform animations on scroll
        // Only transition background-color for stability
        'transition-colors duration-300',
        scrolled
          ? 'bg-[rgba(6,11,20,0.92)] backdrop-blur-md border-b border-white/[0.05]'
          : 'bg-transparent'
      )}
      style={{ 
        // STABILIZED: Only will-change on background
        willChange: 'background-color',
        // Prevent subpixel rendering issues
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* LUXURY: Max-width container (1280px) */}
      <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between gap-8">
        {/* Logo - Clean, no animations */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative w-10 h-10">
            {/* LUXURY: Subtle gradient, no neon glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500" />
            <div className="absolute inset-[3px] rounded-lg bg-[#060b14] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none">
                <path 
                  d="M12 2L8 8H4L12 22L20 8H16L12 2Z" 
                  fill="currentColor" 
                />
              </svg>
            </div>
          </div>
          <span className="text-xl font-bold text-white hidden sm:block">
            Vessel
          </span>
        </Link>

        {/* Center Navigation Pill - Matte finish */}
        <div className="hidden md:flex items-center bg-white/[0.05] backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/[0.08]">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Button - STABILIZED: No magnetic effect, simple hover */}
        <Link
          href="/wallet"
          className="group relative overflow-hidden px-5 py-2.5 text-sm font-semibold text-white rounded-full flex-shrink-0 transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Launch Wallet
            <svg 
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;

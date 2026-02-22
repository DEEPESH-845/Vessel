'use client';

/**
 * Navbar Component
 * Fixed navigation with frosted glass effect and scroll states
 * 
 * STABILIZED: Fixed height, consistent padding, no layout shift
 * ALIGNMENT: Pixel-perfect spacing, no jitter
 */

import { useState, useEffect, useRef } from 'react';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // STABILIZED: Reduced magnetic effect strength to prevent jitter
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // STABILIZED: Reduced strength from 0.15 to 0.08
      const deltaX = (e.clientX - centerX) * 0.08;
      const deltaY = (e.clientY - centerY) * 0.08;
      
      // Only apply if cursor is within reasonable distance
      const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
      if (distance < 120) {
        setMousePosition({ x: deltaX, y: deltaY });
      } else {
        setMousePosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <nav
      className={cn(
        // STABILIZED: Fixed positioning with consistent height
        'fixed top-0 left-0 right-0 z-[100]',
        // STABILIZED: Height per spec - 64px mobile, 72px desktop
        'h-16 lg:h-[72px]',
        // STABILIZED: Consistent padding - 24px mobile, 64px desktop
        'px-6 lg:px-16',
        // Flex layout
        'flex items-center',
        // GPU acceleration for stable rendering
        'transform-gpu',
        // Transition for background only
        'transition-colors duration-300',
        scrolled
          ? 'bg-[rgba(6,11,20,0.92)] backdrop-blur-xl border-b border-white/[0.05]'
          : 'bg-transparent'
      )}
      style={{ 
        willChange: 'background-color',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* STABILIZED: Max-width container */}
      <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-[3px] rounded-lg bg-black flex items-center justify-center">
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

        {/* Center Navigation Pill */}
        <div className="hidden md:flex items-center bg-white/[0.05] backdrop-blur-xl rounded-full px-2 py-1.5 border border-white/[0.08]">
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

        {/* CTA Button - STABILIZED: Reduced hover scale */}
        <Link
          ref={buttonRef}
          href="/wallet"
          className="group relative overflow-hidden px-5 py-2.5 text-sm font-semibold text-white rounded-full flex-shrink-0"
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
            // STABILIZED: Smooth transform transition
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: 'transform 0.15s ease-out, box-shadow 0.3s ease',
            willChange: 'transform',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
            setMousePosition({ x: 0, y: 0 });
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

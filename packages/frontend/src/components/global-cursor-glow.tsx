'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/animations/gsap-config';

export function GlobalCursorGlow() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined' || !cursorRef.current || !glowRef.current) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([cursorRef.current, glowRef.current], { display: 'none' });
      return;
    }

    // Use GSAP's quickTo for maximum performance
    // A single, larger, distinctive cursor that lags slightly for that smooth cinematic feel
    const xToCursor = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power3.out" });
    const yToCursor = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power3.out" });

    // The massive ambient glow stays behind
    const xToGlow = gsap.quickTo(glowRef.current, "x", { duration: 0.8, ease: "power3.out" });
    const yToGlow = gsap.quickTo(glowRef.current, "y", { duration: 0.8, ease: "power3.out" });

    let isVisible = false;
    let isHovering = false;

    const handleMouseMove = (e: MouseEvent) => {
      // Reveal on first move
      if (!isVisible) {
        isVisible = true;
        gsap.to([cursorRef.current, glowRef.current], {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
        });
      }

      xToCursor(e.clientX);
      yToCursor(e.clientY);

      xToGlow(e.clientX);
      yToGlow(e.clientY);
    };

    // Handle interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over clickable elements
      if (target.closest('a, button, input, [role="button"], .cursor-pointer')) {
        isHovering = true;
        gsap.to(cursorRef.current, {
          scale: 2.5,
          backgroundColor: 'transparent',
          border: '1.5px solid #ffffff',
          duration: 0.4,
          ease: 'power3.out'
        });
      } else {
        isHovering = false;
        gsap.to(cursorRef.current, {
          scale: 1,
          backgroundColor: '#ffffff',
          border: '0px solid transparent',
          duration: 0.4,
          ease: 'power3.out'
        });
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      gsap.to([cursorRef.current, glowRef.current], { opacity: 0, scale: 0.5, duration: 0.5, ease: "power2.in" });
    };

    const handleMouseDown = () => {
      if (isHovering) {
        gsap.to(cursorRef.current, { scale: 1.8, duration: 0.15, ease: "power2.out" });
      } else {
        gsap.to(cursorRef.current, { scale: 0.5, duration: 0.15, ease: "power2.out" });
      }
    };

    const handleMouseUp = () => {
      if (isHovering) {
        gsap.to(cursorRef.current, { scale: 2.5, duration: 0.3, ease: "power3.out" });
      } else {
        gsap.to(cursorRef.current, { scale: 1, duration: 0.3, ease: "power3.out" });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Massive Ambient Glow - This goes behind everything */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 w-[800px] h-[800px] -ml-[400px] -mt-[400px] rounded-full blur-[120px] mix-blend-screen pointer-events-none z-[9998] hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(0, 255, 65, 0.15) 0%, rgba(0, 240, 255, 0.05) 50%, transparent 70%)',
          willChange: 'transform, opacity, scale',
          opacity: 0,
          scale: 0.8,
        }}
        aria-hidden="true"
      />

      {/* Awwwards Style Singular Cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 rounded-full pointer-events-none z-[9999] hidden md:flex mix-blend-difference items-center justify-center"
        style={{
          willChange: 'transform, opacity, scale, background-color, border',
          opacity: 0,
          scale: 0.5,
          backgroundColor: '#ffffff',
        }}
        aria-hidden="true"
      />
    </>
  );
}
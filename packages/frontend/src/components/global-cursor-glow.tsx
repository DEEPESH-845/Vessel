'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function GlobalCursorGlow() {
  const cursorGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined' || !cursorGlowRef.current) return;

    // Use GSAP's quickSetter for maximum performance when tracking cursor exactly
    const xTo = gsap.quickTo(cursorGlowRef.current, "x", { duration: 0.15, ease: "power2.out" });
    const yTo = gsap.quickTo(cursorGlowRef.current, "y", { duration: 0.15, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      // Use exact viewport client coordinates (fixed position ignores scroll)
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initial hide/reveal on enter
    gsap.fromTo(cursorGlowRef.current,
      { opacity: 0, scale: 0.5 },
      { opacity: 0.15, scale: 1, duration: 2, ease: "power2.out" }
    );

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={cursorGlowRef}
      className="fixed top-0 left-0 w-[400px] h-[400px] -ml-[200px] -mt-[200px] rounded-full blur-[100px] bg-[#00ff41] mix-blend-screen pointer-events-none z-0"
      style={{
        willChange: 'transform, opacity',
        opacity: 0, // Starts hidden, animated in by GSAP
      }}
      aria-hidden="true"
    />
  );
}

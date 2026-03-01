'use client';

import { useEffect } from 'react';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
import { gsap, ScrollTrigger } from '@/lib/animations/gsap-config';

export function LenisProvider({ children }: { children: any }) {
  // Sync Lenis scroll with GSAP ScrollTrigger
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Clear ScrollTrigger cache and reset scroll position to top on reload to prevent jumpy pinned sections
    // This solves the Next.js hydration "scroll jump" bug
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // This ensures any pinning calculates properly when returning to the page
    ScrollTrigger.clearScrollMemory('manual');

    // Slight delay to allow DOM to settle before calculating heights
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <ReactLenis
      root
      autoRaf={false}
      options={{
        lerp: 0.05,
        duration: 1.5,
        smoothWheel: true,
        orientation: 'vertical',
        gestureOrientation: 'vertical'
      }}
    >
      <LenisGsapSync />
      {children}
    </ReactLenis>
  );
}

// Helper component to bind Lenis instance to GSAP ScrollTrigger
function LenisGsapSync() {
  const lenis = useLenis((lenis) => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    if (lenis) {
      // Create a stable function reference to ensure correct removal in cleanup
      const rafCallback = (time: number) => {
        lenis.raf(time * 1000);
      };

      // Connect GSAP ticker to Lenis requestAnimationFrame
      gsap.ticker.add(rafCallback);

      // Important: prevent GSAP's default lag smoothing to avoid visual jumping when Lenis handles scroll
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(rafCallback);
      };
    }
  }, [lenis]);

  return null;
}
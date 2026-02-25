'use client';

/**
 * useCursorParallax Hook
 * Tracks mouse position for parallax effects in 3D scenes
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface CursorPosition {
  x: number;  // -1 to 1 (centered)
  y: number;  // -1 to 1 (centered)
  normalizedX: number;  // 0 to 1
  normalizedY: number;  // 0 to 1
}

interface UseCursorParallaxOptions {
  /**
   * Smoothing factor (0-1). Higher = more responsive, lower = smoother
   * STABILIZED: Default reduced to 0.05 for buttery smooth parallax
   * @default 0.05
   */
  smoothing?: number;
  
  /**
   * Whether to enable the tracking
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Reduced motion support
   * @default true
   */
  respectReducedMotion?: boolean;
}

export function useCursorParallax(options: UseCursorParallaxOptions = {}) {
  const {
    smoothing = 0.1,
    enabled = true,
    respectReducedMotion = true,
  } = options;

  const [position, setPosition] = useState<CursorPosition>({
    x: 0,
    y: 0,
    normalizedX: 0.5,
    normalizedY: 0.5,
  });

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (!respectReducedMotion) return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [respectReducedMotion]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled || reducedMotion) return;
    
    // Calculate normalized position (-1 to 1, centered)
    targetRef.current = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: (e.clientY / window.innerHeight) * 2 - 1,
    };
  }, [enabled, reducedMotion]);

  // Animation loop for smooth interpolation
  useEffect(() => {
    if (!enabled || reducedMotion) {
      setPosition({ x: 0, y: 0, normalizedX: 0.5, normalizedY: 0.5 });
      return;
    }

    const animate = () => {
      // Lerp towards target
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * smoothing;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * smoothing;

      setPosition({
        x: currentRef.current.x,
        y: currentRef.current.y,
        normalizedX: (currentRef.current.x + 1) / 2,
        normalizedY: (currentRef.current.y + 1) / 2,
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled, reducedMotion, smoothing, handleMouseMove]);

  return position;
}

/**
 * Hook for magnetic effect on buttons
 * Returns transform values to apply to an element
 */
export function useMagneticEffect(
  ref: React.RefObject<HTMLElement>,
  strength: number = 0.3
) {
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      
      setTransform({ x: deltaX, y: deltaY });
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setTransform({ x: 0, y: 0 });
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [ref, strength]);

  return { transform, isHovered };
}
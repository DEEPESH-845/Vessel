'use client';

/**
 * useScrollReveal Hook
 * GSAP ScrollTrigger-based reveal animations for sections
 */

import { useEffect, useRef, useCallback } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface ScrollRevealOptions {
  /**
   * Animation type
   * @default 'fadeUp'
   */
  animation?: 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideLeft' | 'slideRight' | 'stagger';
  
  /**
   * Duration in seconds
   * @default 0.8
   */
  duration?: number;
  
  /**
   * Delay in seconds
   * @default 0
   */
  delay?: number;
  
  /**
   * Start position for ScrollTrigger
   * @default 'top 80%'
   */
  start?: string;
  
  /**
   * End position for ScrollTrigger
   * @default 'bottom 20%'
   */
  end?: string;
  
  /**
   * Toggle actions
   * @default 'play none none none'
   */
  toggleActions?: string;
  
  /**
   * Scrub value (true for smooth scroll-linked, number for duration)
   */
  scrub?: boolean | number;
  
  /**
   * Stagger amount for child elements
   */
  stagger?: number | gsap.StaggerVars;
  
  /**
   * Easing function
   * @default 'power3.out'
   */
  ease?: string;
  
  /**
   * Elements to animate (selector or refs)
   */
  targets?: string | React.RefObject<HTMLElement>[];
  
  /**
   * Enable parallax effect
   */
  parallax?: boolean;
  
  /**
   * Parallax strength
   * @default 100
   */
  parallaxStrength?: number;
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const {
    animation = 'fadeUp',
    duration = 0.8,
    delay = 0,
    start = 'top 85%',
    end = 'bottom 15%',
    toggleActions = 'play none none none',
    scrub = false,
    stagger = 0.1,
    ease = 'power3.out',
    targets,
    parallax = false,
    parallaxStrength = 100,
  } = options;

  const containerRef = useRef<T>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Get animation properties based on type
  const getAnimationProps = useCallback(() => {
    switch (animation) {
      case 'fadeUp':
        return { from: { opacity: 0, y: 60 }, to: { opacity: 1, y: 0 } };
      case 'fadeIn':
        return { from: { opacity: 0 }, to: { opacity: 1 } };
      case 'scaleIn':
        return { from: { opacity: 0, scale: 0.9 }, to: { opacity: 1, scale: 1 } };
      case 'slideLeft':
        return { from: { opacity: 0, x: 80 }, to: { opacity: 1, x: 0 } };
      case 'slideRight':
        return { from: { opacity: 0, x: -80 }, to: { opacity: 1, x: 0 } };
      case 'stagger':
        return { from: { opacity: 0, y: 40 }, to: { opacity: 1, y: 0 } };
      default:
        return { from: { opacity: 0, y: 60 }, to: { opacity: 1, y: 0 } };
    }
  }, [animation]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    if (!container) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Just show the element without animation
      gsap.set(container, { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    // Get targets
    let elements: HTMLElement[];
    if (targets) {
      if (typeof targets === 'string') {
        elements = Array.from(container.querySelectorAll(targets));
      } else {
        elements = targets
          .map(ref => ref.current)
          .filter((el): el is HTMLElement => el !== null);
      }
    } else {
      elements = [container];
    }

    const { from, to } = getAnimationProps();

    // Set initial state
    gsap.set(elements, from);

    // Create the animation
    const tweenConfig: gsap.TweenVars = {
      ...to,
      duration,
      delay,
      ease,
      stagger: animation === 'stagger' || elements.length > 1 ? stagger : 0,
    };

    // Create ScrollTrigger
    triggerRef.current = ScrollTrigger.create({
      trigger: container,
      start,
      end,
      toggleActions,
      scrub,
      onEnter: () => {
        if (!scrub) {
          tweenRef.current = gsap.to(elements, tweenConfig);
        }
      },
      onLeave: () => {
        if (scrub) {
          tweenRef.current = gsap.to(elements, tweenConfig);
        }
      },
      onEnterBack: () => {
        if (!scrub) {
          tweenRef.current = gsap.to(elements, tweenConfig);
        }
      },
    });

    // If scrub is enabled, create a scroll-linked animation
    if (scrub) {
      tweenRef.current = gsap.to(elements, {
        ...tweenConfig,
        scrollTrigger: {
          trigger: container,
          start,
          end,
          scrub: typeof scrub === 'number' ? scrub : true,
        },
      });
    }

    // Parallax effect
    if (parallax) {
      gsap.to(container, {
        y: parallaxStrength,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    return () => {
      // Cleanup
      if (triggerRef.current) {
        triggerRef.current.kill();
      }
      if (tweenRef.current) {
        tweenRef.current.kill();
      }
    };
  }, [animation, duration, delay, start, end, toggleActions, scrub, stagger, ease, targets, parallax, parallaxStrength, getAnimationProps]);

  return containerRef;
}

/**
 * Hook for creating a staggered reveal of multiple elements
 */
export function useStaggeredReveal<T extends HTMLElement>(
  selector: string,
  options: Omit<ScrollRevealOptions, 'animation' | 'targets'> = {}
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll(selector);
    if (!elements.length) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(elements, { opacity: 1, y: 0 });
      return;
    }

    const {
      duration = 0.6,
      delay = 0,
      start = 'top 85%',
      stagger = 0.1,
      ease = 'power3.out',
    } = options;

    // Set initial state
    gsap.set(elements, { opacity: 0, y: 40 });

    // Create ScrollTrigger
    const trigger = ScrollTrigger.create({
      trigger: container,
      start,
      onEnter: () => {
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease,
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [selector, options]);

  return containerRef;
}

/**
 * Hook for parallax scroll effect
 */
export function useParallax<T extends HTMLElement>(
  strength: number = 0.5,
  direction: 'vertical' | 'horizontal' = 'vertical'
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const element = elementRef.current;
    if (!element) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const property = direction === 'vertical' ? 'y' : 'x';
    const value = direction === 'vertical' ? strength * 100 : strength * 100;

    gsap.to(element, {
      [property]: value,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [strength, direction]);

  return elementRef;
}
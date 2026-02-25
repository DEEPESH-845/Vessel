"use client";

import { useLayoutEffect, RefObject } from 'react';
import { gsap, EASE } from '@/lib/animations/gsap-config';

interface RevealConfig {
    yOffset?: number;
    duration?: number;
    delay?: number;
    stagger?: number;
    ease?: string;
    triggerHook?: string; // e.g. "top 85%"
}

/**
 * Attaches a premium cinematic entrance reveal to a section or a stagger group
 * utilizing GSAP ScrollTrigger. Automatically cleans up on unmount to prevent
 * memory leaks and layout thrashing.
 */
export function useSectionReveal(
    currentRef: RefObject<HTMLElement | null>,
    selectors: string[] | string = [],
    config: RevealConfig = {}
) {
    const {
        yOffset = 60,
        duration = 1.2,
        delay = 0,
        stagger = 0.1,
        ease = EASE.expoOut,
        triggerHook = "top 85%"
    } = config;

    // Use layout effect to ensure DOM is ready before GSAP calculates geometry
    useLayoutEffect(() => {
        if (!currentRef.current || typeof window === "undefined") return;

        // Create a gsap context bound to this component's DOM scope 
        // This is CRITICAL for React 18+ strict mode and cleanup
        const ctx = gsap.context(() => {
            const targets = Array.isArray(selectors)
                ? selectors.map(s => gsap.utils.toArray(s)).flat()
                : selectors === "" ? [currentRef.current] : gsap.utils.toArray(selectors);

            if (!targets || targets.length === 0 || targets[0] === null) return;

            gsap.from(targets, {
                scrollTrigger: {
                    trigger: currentRef.current,
                    start: triggerHook,
                    // Optional: Add toggleActions if we want re-reveal on scroll up
                    // toggleActions: "play none none reverse" 
                },
                y: yOffset,
                opacity: 0,
                duration,
                stagger,
                ease,
                delay,
                clearProps: "all" // Prevent transform lingering after animation
            });
        }, currentRef);

        return () => ctx.revert(); // Flawless cleanup
    }, [currentRef, selectors, yOffset, duration, delay, stagger, ease, triggerHook]);
}

"use client";

import { useEffect, useRef, RefObject } from 'react';
import { gsap, EASE } from '@/lib/animations/gsap-config';

interface MagneticOptions {
    strength?: number; // How far it moves (default 30)
    tension?: number; // How fast it snaps back (default 0.8)
}

/**
 * Premium Awwwards-style magnetic effect for buttons and elements.
 * Creates a "sticky" physics feel when the cursor moves over a target.
 */
export function useMagnetic<T extends HTMLElement>(options: MagneticOptions = {}): RefObject<T | null> {
    const ref = useRef<T>(null);
    const { strength = 30, tension = 0.8 } = options;

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof window === "undefined") return;

        let xTo: gsap.QuickToFunc;
        let yTo: gsap.QuickToFunc;

        // Use GSAP Context for memory-safe cleanups
        const ctx = gsap.context(() => {
            // quickTo is highly optimized for mouse tracking (skips timeline overhead)
            xTo = gsap.quickTo(el, "x", { duration: tension, ease: EASE.expoOut });
            yTo = gsap.quickTo(el, "y", { duration: tension, ease: EASE.expoOut });
        }, el);

        const onMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { height, width, left, top } = el.getBoundingClientRect();

            const centerX = left + width / 2;
            const centerY = top + height / 2;

            // Calculate distance normalized from center (guarded against division by zero)
            const safeWidth = Math.max(width / 2, 1);
            const safeHeight = Math.max(height / 2, 1);

            const distanceX = (clientX - centerX) / safeWidth;
            const distanceY = (clientY - centerY) / safeHeight;

            xTo(distanceX * strength);
            yTo(distanceY * strength);
        };

        const onMouseLeave = () => {
            xTo(0);
            yTo(0);
        };

        el.addEventListener("mousemove", onMouseMove);
        el.addEventListener("mouseleave", onMouseLeave);

        return () => {
            el.removeEventListener("mousemove", onMouseMove);
            el.removeEventListener("mouseleave", onMouseLeave);
            ctx.revert();
        };
    }, [strength, tension]);

    return ref;
}

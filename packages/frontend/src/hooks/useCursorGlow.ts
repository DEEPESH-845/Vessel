"use client";

import { useEffect, useRef, RefObject } from 'react';
import { gsap, EASE } from '@/lib/animations/gsap-config';

interface GlowOptions {
    color?: string; // Example: "rgba(59, 130, 246, 0.15)"
    size?: number; // Spread of the glow (default 400px)
}

/**
 * Attaches a premium cursor-following radial glow to a container element.
 * Creates the "Apple/Vercel" aesthetic where moving the mouse illuminates
 * borders and backgrounds subtly.
 */
export function useCursorGlow<T extends HTMLElement>(options: GlowOptions = {}): RefObject<T | null> {
    const ref = useRef<T>(null);
    const { color = "rgba(59, 130, 246, 0.15)", size = 400 } = options;

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof window === "undefined") return;

        // Respect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Inject the CSS vars initially
        el.style.setProperty("--cursor-x", "50%");
        el.style.setProperty("--cursor-y", "50%");

        // We use a pseudo-element pattern in the CSS to apply the radial gradient
        // This hook just feeds it coordinates blazingly fast via GSAP QuickSetter
        let updateX: (val: number) => void;
        let updateY: (val: number) => void;

        const ctx = gsap.context(() => {
            // Direct raw property setter for max perf
            updateX = gsap.utils.pipe(Math.round, val => el.style.setProperty("--cursor-x", `${val}px`));
            updateY = gsap.utils.pipe(Math.round, val => el.style.setProperty("--cursor-y", `${val}px`));
        }, el);

        const onMouseMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            // Calculate cursor position relative to the container element
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            updateX(x);
            updateY(y);
        };

        el.addEventListener("mousemove", onMouseMove);

        return () => {
            el.removeEventListener("mousemove", onMouseMove);
            ctx.revert();
        };
    }, [color, size]);

    return ref;
}

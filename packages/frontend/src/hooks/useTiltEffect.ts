"use client";

import { useEffect, useRef, RefObject } from 'react';
import { gsap, EASE } from '@/lib/animations/gsap-config';

interface TiltOptions {
    tiltIntensity?: number; // How much it tilts (default 10)
    glareIntensity?: number; // Scale of glare effect (default 0.2)
    scale?: number; // Scale on hover (default 1.02)
}

/**
 * Premium 3D tilt effect for cards.
 * Uses performant GSAP quickTo setters to avoid React re-renders.
 */
export function useTiltEffect<T extends HTMLElement = HTMLDivElement>(options: TiltOptions = {}): RefObject<T | null> {
    const ref = useRef<T>(null);
    const { tiltIntensity = 10, glareIntensity = 0.2, scale = 1.02 } = options;

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof window === "undefined") return;

        // Apply necessary 3D perspective to parent if not present
        gsap.set(el.parentElement, { perspective: 1000 });
        // Ensure element has transformStyle to preserve 3D children
        gsap.set(el, { transformStyle: "preserve-3d" });

        let xTo: gsap.QuickToFunc;
        let yTo: gsap.QuickToFunc;
        let scaleTo: gsap.QuickToFunc;

        const ctx = gsap.context(() => {
            // Rotation uses power3 for a slightly heavier, "physical card" feel
            xTo = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: EASE.power3Out });
            yTo = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: EASE.power3Out });
            scaleTo = gsap.quickTo(el, "scale", { duration: 0.6, ease: EASE.power3Out });
        }, el);

        const onMouseEnter = () => {
            scaleTo(scale);
        };

        const onMouseMove = (e: MouseEvent) => {
            const { left, top, width, height } = el.getBoundingClientRect();
            const clientX = e.clientX;
            const clientY = e.clientY;

            // Calculate percentage position of cursor over element (-1 to 1)
            const xPos = (clientX - left) / width - 0.5;
            const yPos = (clientY - top) / height - 0.5;

            // Note: rotationX is controlled by vertical mouse movement (yPos)
            yTo(xPos * tiltIntensity);
            xTo(-yPos * tiltIntensity); // Invert Y for native feel
        };

        const onMouseLeave = () => {
            xTo(0);
            yTo(0);
            scaleTo(1);
        };

        el.addEventListener("mouseenter", onMouseEnter);
        el.addEventListener("mousemove", onMouseMove);
        el.addEventListener("mouseleave", onMouseLeave);

        return () => {
            el.removeEventListener("mouseenter", onMouseEnter);
            el.removeEventListener("mousemove", onMouseMove);
            el.removeEventListener("mouseleave", onMouseLeave);
            ctx.revert();
        };
    }, [tiltIntensity, glareIntensity, scale]);

    return ref;
}

"use client";

import { useLayoutEffect, useRef } from 'react';
import { gsap, EASE } from '@/lib/animations/gsap-config';
import { useDemoStore, DemoStep } from '@/store/demo-store';

/**
 * Hook to manage the Master GSAP Timeline during the "Execute Payment" Story.
 * Observers Zustand demoStore state (currentStep) and orchestrates 
 * complex sequences across multiple distinct UI components.
 */
export function useInteractiveFlow() {
    const { currentStep } = useDemoStore();
    const tl = useRef<gsap.core.Timeline | null>(null);
    const ctxRef = useRef<gsap.Context | null>(null);

    useLayoutEffect(() => {
        if (typeof window === "undefined") return;

        // Create a stable context for cleanup
        ctxRef.current = gsap.context(() => { });

        return () => {
            ctxRef.current?.revert();
        };
    }, []);

    useLayoutEffect(() => {
        if (!ctxRef.current || typeof window === "undefined") return;

        // We add to the context to ensure safe cleanup when components unmount
        ctxRef.current.add(() => {
            // Common config
            const defaultDuration = 0.6;
            const defaultEase = EASE.expoOut;

            switch (currentStep) {
                case 'auth':
                    // Kill previous timeline if playing
                    if (tl.current) tl.current.kill();

                    tl.current = gsap.timeline({ defaults: { ease: defaultEase, duration: defaultDuration } });

                    // Flash the engine CTA container
                    tl.current.to(".engine-glow", { opacity: 0.8, duration: 0.2, yoyo: true, repeat: 1 })
                        // Illuminate the first flow node (SDK -> Auth)
                        .to(".flow-node:nth-child(2)", { scale: 1.1, boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)", duration: 0.4 })
                        // Animate line progress
                        .to(".flow-line", { scaleX: 0.2, duration: 0.6 }, "-=0.2")
                        // Reveal KMS signature log entry in the drawer
                        .fromTo(".log-entry:nth-child(1)", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4 }, "-=0.3");
                    break;

                case 'ai-risk':
                    tl.current = gsap.timeline({ defaults: { ease: defaultEase, duration: defaultDuration } });

                    tl.current.to(".flow-node:nth-child(2)", { scale: 1, boxShadow: "none", duration: 0.3 })
                        .to(".flow-node:nth-child(3)", { scale: 1.1, boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)", duration: 0.4 })
                        .to(".flow-line", { scaleX: 0.4, duration: 0.5 }, "-=0.2")
                        // Flash the AI panel border
                        .to(".card-cinematic:has(.lucide-brain-circuit)", { borderColor: "rgba(59, 130, 246, 0.6)", duration: 0.3, yoyo: true, repeat: 1 }, "-=0.2");
                    break;

                case 'gas-prediction':
                    tl.current = gsap.timeline({ defaults: { ease: defaultEase, duration: defaultDuration } });

                    tl.current.to(".flow-node:nth-child(3)", { scale: 1, boxShadow: "none", duration: 0.3 })
                        .to(".flow-node:nth-child(4)", { scale: 1.1, boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)", duration: 0.4 })
                        .to(".flow-line", { scaleX: 0.6, duration: 0.5 }, "-=0.2");
                    break;

                case 'swap':
                    tl.current = gsap.timeline({ defaults: { ease: defaultEase, duration: defaultDuration } });

                    tl.current.to(".flow-node:nth-child(4)", { scale: 1, boxShadow: "none", duration: 0.3 })
                        .to(".flow-node:nth-child(5)", { scale: 1.1, boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)", duration: 0.4 })
                        .to(".flow-line", { scaleX: 0.8, duration: 0.5 }, "-=0.2");
                    break;

                case 'settlement':
                    tl.current = gsap.timeline({ defaults: { ease: defaultEase, duration: defaultDuration } });

                    tl.current.to(".flow-node:nth-child(5)", { scale: 1, boxShadow: "none", duration: 0.3 })
                        .to(".flow-node:nth-child(6)", { scale: 1.1, boxShadow: "0 0 30px rgba(74, 222, 128, 0.4)", duration: 0.4 })
                        .to(".flow-line", { scaleX: 1, duration: 0.5 }, "-=0.2")
                        // Flash Merchant telemetry board
                        .to(".card-cinematic:has(.lucide-bar-chart-3)", { borderColor: "rgba(74, 222, 128, 0.6)", duration: 0.3, yoyo: true, repeat: 1 }, "-=0.2");
                    break;

                case 'complete':
                    tl.current = gsap.timeline({ defaults: { ease: defaultEase, duration: defaultDuration } });

                    tl.current.to(".flow-node:nth-child(6)", { scale: 1, boxShadow: "none", duration: 0.4 })
                        .to(".engine-glow", { opacity: 0, duration: 0.8 }, 0)
                        // Log entry for completion
                        .fromTo(".log-entry:nth-child(3)", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4 }, 0);
                    break;

                case 'idle':
                    // Reset all visual states
                    if (tl.current) tl.current.kill();
                    gsap.set([".flow-node", ".log-entry", ".flow-line", ".engine-glow", ".card-cinematic"], { clearProps: "opacity,scale,boxShadow,scaleX,x,borderColor" });
                    break;
            }
        });

    }, [currentStep]);

    return { timeline: tl.current };
}

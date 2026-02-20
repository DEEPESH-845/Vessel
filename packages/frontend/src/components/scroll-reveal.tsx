"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap-config";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  from?: "bottom" | "top" | "left" | "right" | "scale";
  amount?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.8,
  from = "bottom",
  amount = 60,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    // Initial state based on direction
    const initialState: gsap.TweenVars = {
      opacity: 0,
    };

    switch (from) {
      case "bottom":
        initialState.y = amount;
        break;
      case "top":
        initialState.y = -amount;
        break;
      case "left":
        initialState.x = -amount;
        break;
      case "right":
        initialState.x = amount;
        break;
      case "scale":
        initialState.scale = 0.8;
        break;
    }

    gsap.set(element, initialState);

    // Animate on scroll
    const animation = gsap.to(element, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top bottom-=100",
        toggleActions: "play none none reverse",
      },
    });

    return () => {
      animation.kill();
    };
  }, [delay, duration, from, amount]);

  return (
    <div ref={elementRef} className={cn("gpu-accelerated", className)}>
      {children}
    </div>
  );
}

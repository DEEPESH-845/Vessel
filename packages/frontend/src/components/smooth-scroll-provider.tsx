"use client";

import { useEffect, type ReactNode } from "react";
import { initLenis, destroyLenis } from "@/lib/lenis";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = initLenis();

    // Add lenis class to html element
    if (typeof window !== "undefined") {
      document.documentElement.classList.add("lenis", "lenis-smooth");
    }

    // Cleanup on unmount
    return () => {
      destroyLenis();
      if (typeof window !== "undefined") {
        document.documentElement.classList.remove("lenis", "lenis-smooth");
      }
    };
  }, []);

  return <>{children}</>;
}

/**
 * useHapticFeedback Hook
 * 
 * Provides haptic feedback for touch interactions on supported devices
 * Falls back gracefully on devices without haptic support
 */

"use client";

import { useCallback } from "react";

type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning" | "error";

export function useHapticFeedback() {
  const triggerHaptic = useCallback((style: HapticStyle = "light") => {
    // Check if device supports haptic feedback
    if (typeof window === "undefined") return;

    // Vibration API (broader support)
    if ("vibrate" in navigator) {
      const patterns: Record<HapticStyle, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [30, 100, 30, 100, 30],
      };
      
      navigator.vibrate(patterns[style]);
    }

    // Haptic Engine API (iOS Safari)
    // @ts-ignore - Haptic Engine is not in TypeScript types
    if (window.navigator?.vibrate) {
      try {
        // @ts-ignore
        window.navigator.vibrate(style === "light" ? 10 : style === "medium" ? 20 : 30);
      } catch (e) {
        // Silently fail if not supported
      }
    }
  }, []);

  const impact = useCallback((intensity: "light" | "medium" | "heavy" = "medium") => {
    triggerHaptic(intensity);
  }, [triggerHaptic]);

  const notification = useCallback((type: "success" | "warning" | "error" = "success") => {
    triggerHaptic(type);
  }, [triggerHaptic]);

  const selection = useCallback(() => {
    triggerHaptic("light");
  }, [triggerHaptic]);

  return {
    impact,
    notification,
    selection,
    triggerHaptic,
  };
}

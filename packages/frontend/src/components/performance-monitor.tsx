/**
 * PerformanceMonitor Component
 * 
 * Monitors and reports web vitals and performance metrics
 * Provides real-time performance feedback in development
 */

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== "development") return;

    // Web Vitals monitoring
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      // FCP - First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            setMetrics((prev) => ({ ...prev, fcp: entry.startTime }));
          }
        }
      });
      fcpObserver.observe({ entryTypes: ["paint"] });

      // LCP - Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        setMetrics((prev) => ({ ...prev, lcp: lastEntry.renderTime || lastEntry.loadTime }));
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            setMetrics((prev) => ({ ...prev, cls: clsValue }));
          }
        }
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });

      // TTFB - Time to First Byte
      const navigationEntry = performance.getEntriesByType("navigation")[0] as any;
      if (navigationEntry) {
        setMetrics((prev) => ({ ...prev, ttfb: navigationEntry.responseStart }));
      }

      return () => {
        fcpObserver.disconnect();
        lcpObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);

  // Toggle visibility with keyboard shortcut (Ctrl/Cmd + Shift + P)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "P") {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  const getScoreColor = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      fcp: { good: 1800, needsImprovement: 3000 },
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      ttfb: { good: 800, needsImprovement: 1800 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return "#71717A";

    if (value <= threshold.good) return "#22c55e"; // Good
    if (value <= threshold.needsImprovement) return "#f59e0b"; // Needs improvement
    return "#ef4444"; // Poor
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-[9999] pointer-events-auto"
          style={{
            background: "rgba(24, 24, 27, 0.95)",
            border: "1px solid rgba(39, 39, 42, 0.8)",
            borderRadius: "16px",
            padding: "16px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            minWidth: "280px",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "#FFFFFF",
              }}
            >
              Performance Metrics
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                color: "#71717A",
                fontSize: "18px",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    color: "#A1A1AA",
                    textTransform: "uppercase",
                  }}
                >
                  {key.toUpperCase()}
                </span>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: getScoreColor(key, value),
                  }}
                >
                  {key === "cls" ? value.toFixed(3) : `${Math.round(value)}ms`}
                </span>
              </div>
            ))}
          </div>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              color: "#52525B",
              marginTop: "12px",
              textAlign: "center",
            }}
          >
            Press Cmd/Ctrl + Shift + P to toggle
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

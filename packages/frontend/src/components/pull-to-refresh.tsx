/**
 * PullToRefresh Component
 * 
 * Mobile-friendly pull-to-refresh gesture for refreshing dashboard data
 * Uses Framer Motion for smooth animations and gesture detection
 */

"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useState, useCallback } from "react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  
  // Transform pull distance to rotation and opacity
  const rotate = useTransform(y, [0, 100], [0, 360]);
  const opacity = useTransform(y, [0, 50, 100], [0, 0.5, 1]);
  const scale = useTransform(y, [0, 100], [0.5, 1]);

  const handleDragEnd = useCallback(async (_: any, info: PanInfo) => {
    // Trigger refresh if pulled down more than 100px
    if (info.offset.y > 100 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        y.set(0);
      }
    } else {
      y.set(0);
    }
  }, [isRefreshing, onRefresh, y]);

  return (
    <div className="relative">
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        style={{
          y: useTransform(y, (value) => Math.min(value - 60, 40)),
          opacity,
        }}
      >
        <motion.div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(204, 255, 0, 0.2)",
            border: "2px solid #CCFF00",
            rotate,
            scale,
            boxShadow: "0 0 20px rgba(204, 255, 0, 0.3)",
          }}
        >
          {isRefreshing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#CCFF00"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
            </motion.div>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CCFF00"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12l7-7 7 7" />
            </svg>
          )}
        </motion.div>
      </motion.div>

      {/* Draggable content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.3, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}

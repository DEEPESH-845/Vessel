"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MiniLineChartProps {
  data: number[];
  width?: number;
  height?: number;
  showGradient?: boolean;
  className?: string;
}

/**
 * MiniLineChart — Sparkline for TVL
 * 
 * SVG path with gradient fill below line
 * Stroke: var(--accent-blue) 1.5px
 * Fill: linear-gradient from rgba(59,130,246,0.3) to transparent
 * No axes, just the curve
 */
export function MiniLineChart({
  data,
  width = 120,
  height = 40,
  showGradient = true,
  className,
}: MiniLineChartProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Generate path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });

  const pathD = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    
    // Smooth curve using cubic bezier
    const prev = points[index - 1];
    const cpX = (prev.x + point.x) / 2;
    
    return `${path} C ${cpX} ${prev.y}, ${cpX} ${point.y}, ${point.x} ${point.y}`;
  }, "");

  // Gradient fill path
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
    >
      <defs>
        {/* Gradient fill */}
        <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {showGradient && (
        <motion.path
          d={areaD}
          fill="url(#sparklineGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Line stroke */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="var(--color-accent-blue)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* End point dot */}
      {points.length > 0 && (
        <motion.circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={3}
          fill="var(--color-accent-cyan)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.2 }}
        />
      )}
    </svg>
  );
}

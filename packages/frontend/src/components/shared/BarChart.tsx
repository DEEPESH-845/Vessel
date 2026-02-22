"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BarChartProps {
  data: number[];
  maxValue?: number;
  height?: number;
  activeIndex?: number;
  onBarHover?: (index: number) => void;
  className?: string;
}

/**
 * BarChart — Small volume bar chart
 * 
 * 6–8 thin rounded bars (border-radius: 4px top)
 * Color: gradient accent-blue → accent-cyan vertically
 * Inactive bars: bg-elevated with slight blue tint
 * Active/hovered bar: full brightness
 * X-axis labels: 10px font-mono text-muted
 */
export function BarChart({
  data,
  maxValue,
  height = 60,
  activeIndex,
  onBarHover,
  className,
}: BarChartProps) {
  const max = maxValue || Math.max(...data);
  
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Bars */}
      <div className="flex items-end justify-between gap-1" style={{ height }}>
        {data.map((value, index) => {
          const barHeight = (value / max) * height;
          const isActive = index === activeIndex;
          
          return (
            <motion.div
              key={index}
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-200",
                isActive
                  ? "bg-gradient-to-t from-[var(--color-accent-blue)] to-[var(--color-accent-cyan)]"
                  : "bg-[var(--color-bg-elevated)]"
              )}
              style={{
                height: Math.max(barHeight, 4),
              }}
              initial={{ height: 0 }}
              animate={{ height: Math.max(barHeight, 4) }}
              transition={{ 
                delay: index * 0.05, 
                duration: 0.3, 
                ease: "easeOut" 
              }}
              onMouseEnter={() => onBarHover?.(index)}
              onMouseLeave={() => onBarHover?.(-1)}
            />
          );
        })}
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between">
        {data.map((_, index) => (
          <span
            key={index}
            className={cn(
              "text-[10px] font-mono transition-colors duration-200",
              index === activeIndex 
                ? "text-[var(--color-accent-cyan)]" 
                : "text-[var(--color-text-muted)]"
            )}
          >
            {index + 1}
          </span>
        ))}
      </div>
    </div>
  );
}

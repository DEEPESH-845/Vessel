"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, BarChart2, DollarSign, Activity } from "lucide-react";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

// Mock data for stats
const statsData = [
  {
    label: "Total Balance",
    value: "$24,582.50",
    change: "+12.5%",
    isPositive: true,
    icon: Wallet,
    sparkline: [20, 25, 22, 30, 28, 35, 40, 38, 45, 50, 48, 55],
  },
  {
    label: "24h Profit",
    value: "$3,072.81",
    change: "+5.2%",
    isPositive: true,
    icon: TrendingUp,
    sparkline: [10, 15, 12, 18, 22, 20, 25, 28, 30, 35, 32, 38],
  },
  {
    label: "Total Assets",
    value: "8",
    change: "+2",
    isPositive: true,
    icon: BarChart2,
    sparkline: [5, 6, 5, 7, 6, 8, 7, 8, 8, 9, 8, 8],
  },
  {
    label: "Trading Volume",
    value: "$142,350",
    change: "-2.3%",
    isPositive: false,
    icon: Activity,
    sparkline: [50, 48, 52, 45, 42, 40, 38, 35, 32, 30, 28, 25],
  },
];

// Simple SVG Sparkline component
function Sparkline({
  data,
  isPositive,
}: {
  data: number[];
  isPositive: boolean;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 32;
  const width = 80;
  const step = width / (data.length - 1);

  const points = data
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const gradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            stopColor={isPositive ? "#22C55E" : "#F43F5E"}
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            stopColor={isPositive ? "#22C55E" : "#F43F5E"}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "#22C55E" : "#F43F5E"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
          >
            <GlassCard hover className="h-full">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "p-2.5 rounded-xl",
                    "bg-[rgba(255,255,255,0.04)]",
                    "border border-[rgba(255,255,255,0.06)]"
                  )}
                >
                  <Icon className="w-5 h-5 text-[#8490A8]" />
                </div>
                <Sparkline data={stat.sparkline} isPositive={stat.isPositive} />
              </div>
              <p className="text-sm text-[#8490A8] mb-1">{stat.label}</p>
              <div className="flex items-end gap-3">
                <span
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {stat.value}
                </span>
                <span
                  className={cn(
                    "flex items-center text-sm font-medium mb-1",
                    stat.isPositive ? "text-[#22C55E]" : "text-[#F43F5E]"
                  )}
                >
                  {stat.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </span>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}

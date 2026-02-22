"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ResponsiveLine } from "@nivo/line";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

// Mock data for the chart
const chartData = [
  {
    id: "portfolio",
    color: "#4F7CFF",
    data: [
      { x: "1D", y: 22000 },
      { x: "2D", y: 22500 },
      { x: "3D", y: 21800 },
      { x: "4D", y: 23200 },
      { x: "5D", y: 22800 },
      { x: "6D", y: 23500 },
      { x: "7D", y: 24100 },
      { x: "8D", y: 23800 },
      { x: "9D", y: 24500 },
      { x: "10D", y: 24200 },
      { x: "11D", y: 24800 },
      { x: "12D", y: 25200 },
      { x: "13D", y: 24900 },
      { x: "14D", y: 25500 },
    ],
  },
];

const timeRanges = ["1D", "1W", "1M", "1Y", "ALL"];

export function PortfolioChart() {
  const [selectedRange, setSelectedRange] = useState("1W");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="h-full"
    >
      <GlassCard padding="none" className="h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h3
              className="text-lg font-semibold text-white mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Portfolio Performance
            </h3>
            <p className="text-sm text-[#8490A8]">Track your assets over time</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[rgba(255,255,255,0.04)]">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  selectedRange === range
                    ? "bg-gradient-to-r from-[#4F7CFF] to-[#7C4DFF] text-white"
                    : "text-[#8490A8] hover:text-white"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px] p-6">
          <ResponsiveLine
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat=" >-.2f"
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 12,
              tickRotation: 0,
              format: (value) => String(value),
              tickValues: 5,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 12,
              tickRotation: 0,
              format: (value) => `$${(Number(value) / 1000).toFixed(0)}k`,
              tickValues: 5,
            }}
            enableGridX={false}
            enableGridY={true}
            gridYValues={5}
            colors={["#4F7CFF"]}
            lineWidth={2.5}
            enablePoints={false}
            pointSize={0}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
            enableArea={true}
            areaOpacity={0.15}
            areaBaselineValue={20000}
            defs={[
              {
                id: "gradient",
                type: "linearGradient",
                colors: [
                  { offset: 0, color: "#4F7CFF", opacity: 0.3 },
                  { offset: 100, color: "#4F7CFF", opacity: 0 },
                ],
              },
            ]}
            fill={[{ match: "*", id: "gradient" }]}
            theme={
              {
                background: "transparent",
                text: {
                  fontSize: 11,
                  fill: "#8490A8",
                },
                axis: {
                  domain: {
                    line: {
                      stroke: "transparent",
                    },
                  },
                  ticks: {
                    line: {
                      stroke: "transparent",
                    },
                    text: {
                      fill: "#8490A8",
                      fontSize: 11,
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: "rgba(255, 255, 255, 0.04)",
                    strokeWidth: 1,
                  },
                },
                crosshair: {
                  line: {
                    stroke: "#4F7CFF",
                    strokeWidth: 1,
                    strokeOpacity: 0.5,
                  },
                },
                tooltip: {
                  container: {
                    background: "rgba(20, 24, 40, 0.95)",
                    color: "#FFFFFF",
                    fontSize: 12,
                    borderRadius: 8,
                    padding: "8px 12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  },
                },
              } as any
            }
            crosshairType="x"
            motionConfig="gentle"
          />
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between px-6 pb-6 pt-0">
          <div>
            <p className="text-sm text-[#8490A8] mb-1">Total Value</p>
            <p
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              $24,582.50
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#8490A8] mb-1">{selectedRange} Change</p>
            <p className="text-lg font-semibold text-[#22C55E]">+$3,072.81 (+12.5%)</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

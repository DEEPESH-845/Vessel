"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDemoStore } from "@/store/demo-store";
import { LineChart, Activity } from "lucide-react";

export function GasPredictionVisualizer() {
  const { currentStep, gasPredicted, gasActual } = useDemoStore();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(currentStep === "gas-prediction" || currentStep === "swap" || currentStep === "settlement" || currentStep === "complete");
  }, [currentStep]);

  // Mock data for the sparkline
  const historicalData = [0.0041, 0.0043, 0.0042, 0.0051, 0.0048, 0.0045, 0.0042, 0.0044, 0.0046, 0.0047, 0.0049, 0.0052, 0.0048];
  const max = Math.max(...historicalData, gasPredicted);
  const min = Math.min(...historicalData, gasActual);
  const range = max - min;
  
  const width = 300;
  const height = 80;
  const points = historicalData.map((val, i) => {
    const x = (i / (historicalData.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const predictedY = height - ((gasPredicted - min) / range) * height;

  return (
    <div className="card-cinematic p-5 relative overflow-hidden group">
      {/* Background Glow */}
      <div 
        className={`absolute -inset-10 bg-accent-purple/10 blur-[80px] rounded-full transition-opacity duration-1000 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent-purple" />
          <h3 className="text-sm font-medium tracking-tight text-white/90">Lisk Gas Prediction</h3>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
           <span className="text-[10px] uppercase tracking-widest text-white/50">Oracle Live</span>
        </div>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Predicted Max</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono text-white/90">{gasPredicted.toFixed(4)}</span>
            <span className="text-xs text-white/40">ETH</span>
          </div>
        </div>
        
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-right"
          >
            <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Actual Settled</p>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-2xl font-mono text-neon-green">{gasActual.toFixed(4)}</span>
              <span className="text-xs text-white/40">ETH</span>
            </div>
            <p className="text-[10px] text-neon-green/80 mt-1 uppercase tracking-wider">
              Saved {(gasPredicted - gasActual).toFixed(4)} ETH
            </p>
          </motion.div>
        )}
      </div>

      <div className="relative h-[80px] w-full mt-4 border-b border-white/5">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Threshold Line */}
          <line 
            x1="0" 
            y1={predictedY} 
            x2={width} 
            y2={predictedY} 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
          />
          <text x={width - 40} y={predictedY - 5} fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">
            Guard Thresh.
          </text>
          
          <motion.polyline
            points={points}
            fill="none"
            stroke="var(--color-accent-purple)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {isActive && (
             <motion.circle
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.5, type: "spring" }}
               cx={width}
               cy={height - ((gasActual - min) / range) * height}
               r="4"
               fill="var(--color-neon-green)"
               className="shadow-[0_0_10px_var(--color-neon-green)]"
             />
          )}
        </svg>

        {/* Gradient Fade for SVG */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0b1422] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemoStore } from "@/store/demo-store";
import { BarChart3, Clock, Globe2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useRef } from "react";

export function RealTimeMerchantDashboard() {
  const { currentStep, latencyNs } = useDemoStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Staggered cinematic reveal of metrics
  useSectionReveal(containerRef, ".merch-anim", {
    yOffset: 20,
    stagger: 0.1,
    duration: 0.8,
    triggerHook: "top 90%"
  });

  const [transactions, setTransactions] = useState([
    { id: "tx_1a2b", status: "success", time: "1min ago", amount: "$14.50" },
    { id: "tx_9c8d", status: "success", time: "3min ago", amount: "$98.00" },
    { id: "tx_4e5f", status: "failed", time: "12min ago", amount: "$5.20" },
  ]);

  useEffect(() => {
    if (currentStep === "complete") {
      setTransactions(prev => [
        { id: `tx_${Math.random().toString(16).slice(2, 6)}`, status: "success", time: "Just now", amount: "$42.00" },
        ...prev.slice(0, 2)
      ]);
    }
  }, [currentStep]);

  return (
    // SPACING FIX: Standardized card padding
    <div ref={containerRef} className="card-cinematic p-8 md:p-10 relative overflow-hidden group h-full flex flex-col justify-between min-h-[300px]">
      
      {/* SPACING FIX: Use consistent `mb-6 md:mb-8` */}
      <div className="relative z-10 flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-neon-green" />
          <h3 className="text-lg md:text-xl font-semibold tracking-tight text-white">Merchant Telemetry</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-green/30 bg-neon-green/10">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-neon-green font-mono">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* SPACING FIX: Inner metric card padding standardized to `p-4 md:p-5` */}
        <div className="merch-anim bg-white/5 rounded-2xl p-4 md:p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-3 text-white/50">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] md:text-xs uppercase tracking-widest">P99 Latency</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <motion.span 
              key={latencyNs}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-mono text-white/90 tracking-tighter"
            >
              {currentStep === "complete" ? latencyNs : "---"}
            </motion.span>
            <span className="text-xs text-white/40">ms</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="merch-anim bg-white/5 rounded-2xl p-4 md:p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-3 text-white/50">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] md:text-xs uppercase tracking-widest">Success Rate</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-mono text-white/90 tracking-tighter">99.9</span>
            <span className="text-xs text-white/40">%</span>
          </div>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="merch-anim flex-1 flex flex-col justify-end">
        <div className="flex items-center justify-between mb-4 text-white/50 text-[10px] md:text-xs uppercase tracking-widest">
          <span>Live Feed</span>
          <Globe2 className="w-4 h-4" />
        </div>
        
        {/* SPACING FIX: Consistent gap spacing for list items */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {transactions.map((tx, idx) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                // SPACING FIX: Inner row padding standardized
                className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  {tx.status === "success" ? (
                    <div className="w-2 h-2 rounded-full bg-neon-green" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                  )}
                  <span className="text-white/80">{tx.id}</span>
                </div>
                <div className="flex gap-6 items-center">
                  <span className="text-white/40 hidden sm:inline-block">{tx.time}</span>
                  <span className={tx.status === "success" ? "text-neon-green" : "text-red-400"}>
                    {tx.amount}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

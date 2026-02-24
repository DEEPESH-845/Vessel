"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemoStore } from "@/store/demo-store";
import { BarChart3, Clock, Globe2, AlertCircle, CheckCircle2 } from "lucide-react";

export function RealTimeMerchantDashboard() {
  const { currentStep, latencyNs } = useDemoStore();
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
    <div className="card-cinematic p-5 relative overflow-hidden group">
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-neon-green" />
          <h3 className="text-sm font-medium tracking-tight text-white/90">Merchant Telemetry</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-neon-green/30 bg-neon-green/10">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          <span className="text-[9px] uppercase tracking-widest text-neon-green font-mono">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Latency Metric */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-white/50">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-widest">P99 Latency</span>
          </div>
          <div className="flex items-baseline gap-1">
            <motion.span 
              key={latencyNs}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-mono text-white/90 tracking-tighter"
            >
              {currentStep === "complete" ? latencyNs : "---"}
            </motion.span>
            <span className="text-[10px] text-white/40">ms</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-white/50">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-widest">Success Rate</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono text-white/90 tracking-tighter">99.9</span>
            <span className="text-[10px] text-white/40">%</span>
          </div>
        </div>
      </div>

      {/* Transaction Feed */}
      <div>
        <div className="flex items-center justify-between mb-3 text-white/50 text-[10px] uppercase tracking-widest">
          <span>Live Feed</span>
          <Globe2 className="w-3.5 h-3.5" />
        </div>
        
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {transactions.map((tx, idx) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  {tx.status === "success" ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  )}
                  <span className="text-white/80">{tx.id}</span>
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-white/40">{tx.time}</span>
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

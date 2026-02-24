"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, BrainCircuit, Activity } from "lucide-react";
import { useDemoStore } from "@/store/demo-store";

export function AIFraudInsightPanel() {
  const { currentStep, fraudScore, confidence } = useDemoStore();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(currentStep === "ai-risk" || currentStep === "swap" || currentStep === "settlement" || currentStep === "complete");
  }, [currentStep]);

  const featureWeights = [
    { label: "IP Velocity", weight: 8 },
    { label: "Wallet Age", weight: 92 },
    { label: "Tx Volume Anomaly", weight: 4 },
    { label: "Behavioral Bio", weight: 15 },
  ];

  return (
    <div className="card-cinematic p-5 relative overflow-hidden group">
      {/* Background Glow */}
      <div 
        className={`absolute -inset-10 bg-primary/20 blur-3xl rounded-full transition-opacity duration-1000 ${
          isActive ? "opacity-30" : "opacity-0"
        }`}
      />

      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-accent-cyan" />
          <h3 className="text-sm font-medium tracking-tight text-white/90">AWS Bedrock Risk Assessment</h3>
        </div>
        <div className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-mono text-white/50">
          claude-3-5-sonnet-v2
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/50 uppercase tracking-widest">Fraud Score</span>
          <div className="flex items-end gap-2">
            <motion.span 
              key={fraudScore}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-3xl font-mono tracking-tighter shadow-sm ${
                fraudScore > 50 ? "text-red-400" : "text-neon-green"
              }`}
            >
              {fraudScore}
            </motion.span>
            <span className="text-xs text-white/40 mb-1">/ 100</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/50 uppercase tracking-widest">Confidence</span>
          <div className="flex items-end gap-2">
            <motion.span 
              key={confidence}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl font-mono tracking-tighter text-white"
            >
              {confidence.toFixed(1)}%
            </motion.span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs text-white/50 uppercase tracking-widest">Feature Importance</span>
        <div className="space-y-2">
          {featureWeights.map((fw, i) => (
            <div key={fw.label} className="relative">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-white/60 font-mono tracking-tight">{fw.label}</span>
                <span className="text-white/40">{fw.weight}%</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: isActive ? `${fw.weight}%` : '0%' }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                  className={`h-full ${
                    fw.weight > 50 ? "bg-neon-green/80" : "bg-accent-cyan/60"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isActive && fraudScore < 15 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <div className="flex items-start gap-2 text-xs text-white/70">
              <ShieldCheck className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
              <p>
                <strong>Transaction Approved.</strong> Behavioral biometrics match historical patterns. No IP velocity anomalies detected.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

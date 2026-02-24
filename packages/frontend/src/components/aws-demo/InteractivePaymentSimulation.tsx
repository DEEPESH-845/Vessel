"use client";

import { useDemoStore } from "@/store/demo-store";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

export function InteractivePaymentSimulation() {
  const { currentStep, simulatePayment, resetDemo } = useDemoStore();
  const isPlaying = currentStep !== 'idle' && currentStep !== 'complete';

  return (
    // SPACING FIX: Use consistent `p-6 md:p-8` for standard interior card breathing room
    <div className="card-cinematic p-6 md:p-8 relative overflow-hidden group w-full h-full flex flex-col items-center justify-center">
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full">
        {/* SPACING FIX: `mb-4` standardized */}
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-white">
          AWS Infra Proof of Work
        </h2>
        {/* SPACING FIX: `mb-8 md:mb-10` standardized */}
        <p className="text-base md:text-lg text-white/60 mb-8 md:mb-10 leading-relaxed font-light">
          Execute a simulated transaction traversing the zero-trust KMS perimeter, Bedrock risk assessment, and Lisk deterministic settlement.
        </p>

        {currentStep === 'idle' || currentStep === 'complete' ? (
          <button
            onClick={currentStep === 'complete' ? resetDemo : simulatePayment}
            // SPACING FIX: button internal padding symmetry px-8 py-4
            className="group relative inline-flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-white text-void rounded-full font-bold text-sm tracking-widest uppercase hover:scale-105 transition-transform"
          >
            {currentStep === 'complete' ? (
              <>
                <RotateCcw className="w-5 h-5" /> Reset Simulation
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-void" /> Execute Payment
              </>
            )}
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-void opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ) : (
          // SPACING FIX: gap-4 spacing 
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-b-2 border-primary animate-spin" />
            <span className="text-sm font-mono uppercase tracking-widest text-primary animate-pulse">
              Processing: {currentStep}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Background Elements */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent z-0 pointer-events-none"
        animate={{ 
          opacity: isPlaying ? [0.3, 0.6, 0.3] : 0 
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}

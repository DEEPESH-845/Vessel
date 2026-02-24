"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemoStore } from "@/store/demo-store";
import { Lock, FileKey2, Shield, CheckCircle } from "lucide-react";

export function SecurityTransparencyDrawer() {
  const { currentStep } = useDemoStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (currentStep === "auth" || currentStep === "complete") {
      setIsOpen(true);
    }
  }, [currentStep]);

  const steps = [
    {
      id: "kms",
      label: "AWS KMS Ephemeral Key Generation",
      icon: <FileKey2 className="w-4 h-4 text-accent-cyan" />,
      status: currentStep === "idle" ? "pending" : "complete"
    },
    {
      id: "paymaster",
      label: "Paymaster Gating (ERC-4337)",
      icon: <Shield className="w-4 h-4 text-accent-purple" />,
      status: ['idle', 'auth'].includes(currentStep) ? "pending" : "complete"
    },
    {
      id: "validation",
      label: "Signature Validation via Bundler",
      icon: <CheckCircle className="w-4 h-4 text-neon-green" />,
      status: currentStep === "settlement" || currentStep === "complete" ? "complete" : "pending"
    }
  ];

  return (
    <div className="card-cinematic p-5 relative overflow-hidden group">
      {/* Background Glow */}
      <div 
        className={`absolute -inset-10 bg-accent-cyan/10 blur-[80px] rounded-full transition-opacity duration-1000 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-accent-cyan" />
          <h3 className="text-sm font-medium tracking-tight text-white/90">Zero-Trust Perimeter</h3>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-white/40 hover:text-white/80 transition-colors bg-white/5 px-2 py-1 rounded text-[10px] uppercase font-mono"
        >
          {isOpen ? "Collapse" : "Expand"}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2">
              {steps.map((step, idx) => (
                <div key={step.id} className="relative flex items-center gap-3">
                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div className="absolute top-8 left-4 w-px h-6 bg-white/10" />
                  )}
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                    step.status === "complete" ? "border-white/20 bg-white/5" : "border-white/5 bg-transparent"
                  }`}>
                    {step.status === "complete" ? step.icon : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`text-sm font-mono tracking-tight transition-colors ${
                      step.status === "complete" ? "text-white/90" : "text-white/40"
                    }`}>
                      {step.label}
                    </p>
                    {step.status === "complete" && step.id === "kms" && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-white/50 mt-1 uppercase tracking-widest break-all"
                      >
                        SIG: 0x{Math.random().toString(16).slice(2, 10)}...{Math.random().toString(16).slice(2, 10)}
                      </motion.p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/50 leading-relaxed font-mono">
                <span className="text-accent-cyan">INFO:</span> All transactions are wrapped as ERC-4337 UserOperations. 
                AWS KMS securely generates ephemeral signers, completely eliminating seed phrase vulnerabilities.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

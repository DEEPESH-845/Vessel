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
      icon: <FileKey2 className="w-5 h-5 text-accent-cyan" />,
      status: currentStep === "idle" ? "pending" : "complete"
    },
    {
      id: "paymaster",
      label: "Paymaster Gating (ERC-4337)",
      icon: <Shield className="w-5 h-5 text-accent-purple" />,
      status: ['idle', 'auth'].includes(currentStep) ? "pending" : "complete"
    },
    {
      id: "validation",
      label: "Signature Validation via Bundler",
      icon: <CheckCircle className="w-5 h-5 text-neon-green" />,
      status: currentStep === "settlement" || currentStep === "complete" ? "complete" : "pending"
    }
  ];

  return (
    // SPACING FIX: Standardized `p-6 md:p-8`
    <div className="card-cinematic p-6 md:p-8 relative overflow-hidden group">
      {/* Background Glow */}
      <div 
        className={`absolute -inset-10 bg-accent-cyan/10 blur-[80px] rounded-full transition-opacity duration-1000 ${
          isOpen ? "opacity-100" : "opacity-0"
        } pointer-events-none`}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 md:w-6 md:h-6 text-accent-cyan" />
          <h3 className="text-base md:text-lg font-medium tracking-tight text-white/90">Zero-Trust Perimeter Executions</h3>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          // SPACING FIX: Consistent button padding scale
          className="text-white/40 hover:text-white/80 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-xs md:text-sm uppercase font-mono tracking-widest border border-white/5 hover:border-white/10"
        >
          {isOpen ? "Collapse" : "Expand Logs"}
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
            {/* SPACING FIX: Top separation standardized to `mt-6 md:mt-8 pt-6 md:pt-8` */}
            <div className="space-y-6 md:space-y-8 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/5">
              {steps.map((step, idx) => (
                // SPACING FIX: Gap adjustment `gap-4 md:gap-6`
                <div key={step.id} className="relative flex items-center gap-4 md:gap-6">
                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div className="absolute top-10 md:top-12 left-5 md:left-6 w-px h-8 md:h-12 bg-white/10" />
                  )}
                  
                  {/* SPACING FIX: Rounded Icon dimensions standardized */}
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                    step.status === "complete" ? "border-white/20 bg-white/5" : "border-white/5 bg-transparent"
                  }`}>
                    {step.status === "complete" ? step.icon : <div className="w-2 h-2 rounded-full bg-white/20" />}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`text-sm md:text-base font-mono tracking-tight transition-colors ${
                      step.status === "complete" ? "text-white/90" : "text-white/40"
                    }`}>
                      {step.label}
                    </p>
                    {step.status === "complete" && step.id === "kms" && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        // SPACING FIX: Top padding `mt-2`
                        className="text-[10px] md:text-xs text-white/50 mt-2 uppercase tracking-widest break-all font-mono"
                      >
                        SIG: 0x{Math.random().toString(16).slice(2, 10)}...{Math.random().toString(16).slice(2, 10)}
                      </motion.p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-white/10">
              <p className="text-xs md:text-sm text-white/50 leading-relaxed font-mono md:max-w-4xl">
                <span className="text-accent-cyan font-bold">INFO:</span> All transactions are wrapped as ERC-4337 UserOperations. 
                AWS KMS securely generates ephemeral signers via federated enclaves, completely eliminating seed phrase vulnerabilities and user-side key management.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

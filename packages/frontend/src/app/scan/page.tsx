"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { DEMO_MERCHANT } from "@/lib/mock-data";
import BottomNav from "@/components/bottom-nav";
import { ArrowLeft, Camera, Keyboard, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScanPage() {
  const router = useRouter();
  const { setPendingPayment } = useApp();
  const [showManual, setShowManual] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace('/');
        }
      } catch (error) {
        setIsAuthenticated(false);
        router.replace('/');
      }
    };

    checkAuth();
  }, [router]);

  const handleScan = () => {
    setPendingPayment(DEMO_MERCHANT);
    router.push("/pay");
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      setPendingPayment(DEMO_MERCHANT);
      router.push("/pay");
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: '#0A0A0A' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: '#A1A1AA', fontFamily: "'Inter', sans-serif" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col min-h-dvh px-5 pt-safe pb-28">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        className="flex items-center gap-3 pt-10 mb-8"
      >
        <motion.button
          onClick={() => router.back()}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 rounded-2xl glass flex items-center justify-center focus-ring"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <div>
          <h1 className="text-h3">Scan to Pay</h1>
          <p className="text-[11px] text-muted-foreground/50">
            Camera or manual entry
          </p>
        </div>
      </motion.div>

      {/* ── Scanner Area ── */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!showManual ? (
            <motion.div
              key="scan"
              initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 22, stiffness: 90 }}
              className="flex flex-col items-center gap-8"
            >
              {/* Scanner Frame */}
              <motion.button
                className="scanner-frame glass-md flex items-center justify-center relative focus-ring"
                onClick={handleScan}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Tap to simulate QR scan"
              >
                <div className="scanner-corner scanner-corner-tl" />
                <div className="scanner-corner scanner-corner-tr" />
                <div className="scanner-corner scanner-corner-bl" />
                <div className="scanner-corner scanner-corner-br" />
                <div className="scanner-line" aria-hidden="true" />

                {/* Center camera icon */}
                <motion.div
                  className="flex flex-col items-center gap-3"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/[0.08] flex items-center justify-center">
                    <Camera className="w-6 h-6 text-primary/50" />
                  </div>
                  <p className="text-[11px] text-muted-foreground/50 text-center max-w-[140px]">
                    Tap to simulate scan
                  </p>
                </motion.div>
              </motion.button>

              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center space-y-3"
              >
                <p className="text-body text-muted-foreground/70">
                  Point camera at merchant QR
                </p>

                {/* Gasless badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/[0.06] border border-primary/10">
                  <Zap
                    className="w-3 h-3 text-primary/70"
                    aria-hidden="true"
                  />
                  <span className="text-[10px] font-medium text-primary/70">
                    This payment will be gasless
                  </span>
                </div>
              </motion.div>

              {/* Manual Entry Toggle */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => setShowManual(true)}
                className="flex items-center gap-2 text-[12px] text-primary/60 font-medium hover:text-primary/90 transition-colors focus-ring rounded-lg px-3 py-1.5"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Keyboard className="w-3.5 h-3.5" />
                Enter code manually
              </motion.button>
            </motion.div>
          ) : (
            /* ── Manual Entry ── */
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-full max-w-[340px] flex flex-col gap-4"
            >
              <div className="glass-md p-5">
                <label
                  htmlFor="merchant-code"
                  className="text-overline text-muted-foreground/60 mb-3 block"
                >
                  Merchant Code
                </label>
                <input
                  id="merchant-code"
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                  placeholder="Enter payment code"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 text-[14px] outline-none focus:border-primary/30 focus:bg-white/[0.04] transition-all placeholder:text-muted-foreground/30"
                  autoFocus
                  autoComplete="off"
                />
              </div>

              <div className="flex gap-2.5">
                <motion.button
                  onClick={() => setShowManual(false)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex-1 py-3.5 rounded-2xl glass text-[13px] font-medium hover:bg-white/[0.04] transition-colors focus-ring"
                >
                  Back to Scan
                </motion.button>
                <motion.button
                  onClick={handleManualSubmit}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex-1 py-3.5 rounded-2xl text-white text-[13px] font-semibold focus-ring"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #06d6a0)",
                  }}
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}

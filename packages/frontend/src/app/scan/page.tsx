"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { DEMO_MERCHANT } from "@/lib/mock-data";
import BottomNav from "@/components/bottom-nav";
import ParticleField from "@/components/particle-field";
import ScrollProgress from "@/components/scroll-progress";
import ErrorBoundary from "@/components/error-boundary";
import MovingBorder from "@/components/aceternity/moving-border";
import { ArrowLeft, Camera, Keyboard, Zap, Shield, QrCode } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function ScanPage() {
  const router = useRouter();
  const { setPendingPayment } = useApp();
  const [showManual, setShowManual] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const backgroundOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

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
    <div
      ref={containerRef}
      className="flex flex-col min-h-dvh relative overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      {/* Scroll progress indicator */}
      <ScrollProgress />

      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          y: backgroundY,
          opacity: backgroundOpacity,
          background:
            "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08), transparent 50%), radial-gradient(circle at 80% 20%, rgba(204, 255, 0, 0.04), transparent 40%)",
        }}
        aria-hidden="true"
      />

      {/* Enhanced particle field */}
      <ParticleField count={15} color="rgba(204, 255, 0, 0.15)" />

      {/* Content wrapper */}
      <div className="relative z-10 px-4 py-6 sm:px-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          className="flex items-center gap-3 pt-8 mb-8"
        >
          <motion.button
            onClick={() => router.back()}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center focus-ring"
            style={{
              background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
              border: "1px solid rgba(39, 39, 42, 0.8)",
            }}
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-[#CCFF00]" />
          </motion.button>
          <div>
            <h1 
              className="text-h3"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              Scan to Pay
            </h1>
            <p 
              className="text-[11px]"
              style={{ color: "#71717A" }}
            >
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
                <ErrorBoundary>
                  <motion.button
                    className="scanner-frame flex items-center justify-center relative focus-ring"
                    style={{
                      background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
                      border: "1px solid rgba(39, 39, 42, 0.8)",
                      borderRadius: "24px",
                    }}
                    onClick={handleScan}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label="Tap to simulate QR scan"
                  >
                    {/* Ambient glow */}
                    <motion.div
                      className="absolute -inset-4 rounded-3xl opacity-0"
                      style={{
                        background: "radial-gradient(circle at 50% 50%, rgba(204, 255, 0, 0.08), transparent 70%)",
                      }}
                      animate={{
                        opacity: [0, 0.3, 0],
                        scale: [0.95, 1.05, 0.95],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      aria-hidden="true"
                    />

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
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))",
                          border: "1px solid rgba(99, 102, 241, 0.2)",
                        }}
                      >
                        <Camera className="w-6 h-6 text-primary/70" />
                      </div>
                      <p 
                        className="text-[11px] text-center max-w-[140px]"
                        style={{ color: "#52525B" }}
                      >
                        Tap to simulate scan
                      </p>
                    </motion.div>
                  </motion.button>
                </ErrorBoundary>

                {/* Instructions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center space-y-3"
                >
                  <p 
                    className="text-body"
                    style={{ color: "#71717A" }}
                  >
                    Point camera at merchant QR
                  </p>

                  {/* Gasless badge */}
                  <div 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))",
                      border: "1px solid rgba(34, 197, 94, 0.15)",
                    }}
                  >
                    <Zap
                      className="w-3.5 h-3.5 text-[#22c55e]"
                      aria-hidden="true"
                    />
                    <span 
                      className="text-[11px] font-medium"
                      style={{ color: "#22c55e" }}
                    >
                      This payment will be gasless
                    </span>
                  </div>
                </motion.div>

                {/* Manual Entry Toggle */}
                <ErrorBoundary>
                  <MovingBorder
                    duration={2000}
                    containerClassName=""
                    borderClassName="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06d6a0]"
                  >
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={() => setShowManual(true)}
                      className="flex items-center gap-2 text-[13px] font-medium focus-ring rounded-xl px-4 py-2.5"
                      style={{
                        background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Keyboard className="w-4 h-4 text-primary/70" />
                      <span style={{ color: "#A1A1AA" }}>Enter code manually</span>
                    </motion.button>
                  </MovingBorder>
                </ErrorBoundary>
              </motion.div>
            ) : (
              /* ── Manual Entry ── */
              <ErrorBoundary>
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="w-full max-w-[340px] flex flex-col gap-4"
                >
                  <div 
                    className="p-5"
                    style={{
                      background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
                      border: "1px solid rgba(39, 39, 42, 0.8)",
                      borderRadius: "20px",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <QrCode className="w-5 h-5 text-[#CCFF00]" />
                      <label
                        htmlFor="merchant-code"
                        className="text-[13px] font-medium"
                        style={{ color: "#FFFFFF" }}
                      >
                        Merchant Code
                      </label>
                    </div>
                    <input
                      id="merchant-code"
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                      placeholder="Enter payment code"
                      className="w-full text-[14px] outline-none"
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        color: "#FFFFFF",
                        transition: "all 0.2s ease",
                      }}
                      autoFocus
                      autoComplete="off"
                    />
                  </div>

                  <div className="flex gap-2.5">
                    <motion.button
                      onClick={() => setShowManual(false)}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex-1 py-3.5 rounded-2xl text-[13px] font-medium focus-ring"
                      style={{
                        background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
                        border: "1px solid rgba(39, 39, 42, 0.8)",
                        color: "#A1A1AA",
                      }}
                    >
                      Back to Scan
                    </motion.button>
                    <MovingBorder
                      duration={2000}
                      containerClassName="flex-1"
                      borderClassName="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06d6a0]"
                    >
                      <motion.button
                        onClick={handleManualSubmit}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex-1 py-3.5 rounded-2xl text-white text-[13px] font-semibold focus-ring"
                        style={{
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        }}
                      >
                        Continue
                      </motion.button>
                    </MovingBorder>
                  </div>
                </motion.div>
              </ErrorBoundary>
            )}
          </AnimatePresence>
        </div>

        {/* Security badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 mt-8"
          style={{ color: "#52525B" }}
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="text-[11px]">Secure scanning</span>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}

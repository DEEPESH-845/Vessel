"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { checkFraud } from "@/lib/fraud-check";
import SlideToPay from "@/components/slide-to-pay";
import ParticleField from "@/components/particle-field";
import ScrollProgress from "@/components/scroll-progress";
import PullToRefresh from "@/components/pull-to-refresh";
import SkeletonLoader from "@/components/skeleton-loader";
import ErrorBoundary from "@/components/error-boundary";
import MovingBorder from "@/components/aceternity/moving-border";
import {
  ArrowLeft,
  BadgeCheck,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  Loader2,
  Sparkles,
  Zap,
  AlertCircle,
  Pencil,
  Wallet,
  Check,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import confetti from "canvas-confetti";

type PaymentState = "confirm" | "processing" | "success" | "error";

/** Format a number as USD currency */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function PayPage() {
  const router = useRouter();
  const { pendingPayment, updatePendingAmount, addTransaction, balances } = useApp();
  const [state, setState] = useState<PaymentState>("confirm");
  const [showFees, setShowFees] = useState(false);
  const [aiVerified, setAiVerified] = useState(false);
  const [aiReason, setAiReason] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const backgroundOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  // Editable amount state
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [amountError, setAmountError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Get max balance for the selected token
  const maxBalance = pendingPayment
    ? balances.find((b) => b.symbol === pendingPayment.token)?.balance ?? 0
    : 0;

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

  useEffect(() => {
    if (isAuthenticated && !pendingPayment) {
      router.replace("/wallet");
    }
  }, [isAuthenticated, pendingPayment, router]);

  useEffect(() => {
    if (pendingPayment) {
      const result = checkFraud({ amount: pendingPayment.amount, address: pendingPayment.address, velocity: 0, avgAmount: 0, countryRisk: 0, sessionAge: 10 });
      setAiVerified(result.approved);
      setAiReason(result.reason);
    }
  }, [pendingPayment]);

  // Focus input when editing mode activates
  useEffect(() => {
    if (isEditingAmount && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingAmount]);

  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#6366f1", "#06d6a0", "#8b5cf6", "#22c55e", "#818cf8", "#CCFF00"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const handlePayment = useCallback(async () => {
    setState("processing");
    await new Promise((resolve) => setTimeout(resolve, 2400));

    if (pendingPayment) {
      addTransaction({
        id: Date.now().toString(),
        merchant: pendingPayment.name,
        amount: pendingPayment.amount,
        token: pendingPayment.token,
        timestamp: "Just now",
        status: "completed",
        txHash: "0xf6760d52...ab12e5ce",
      });
    }

    setState("success");
    triggerConfetti();
  }, [pendingPayment, addTransaction, triggerConfetti]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  // ── Editable Amount Handlers ──
  const startEditing = () => {
    if (!pendingPayment) return;
    setEditValue(pendingPayment.amount.toFixed(2));
    setAmountError("");
    setIsEditingAmount(true);
  };

  const validateAndSave = () => {
    const num = parseFloat(editValue);

    if (isNaN(num) || num <= 0) {
      setAmountError("Enter a valid amount");
      return;
    }

    if (num < 0.01) {
      setAmountError("Minimum $0.01");
      return;
    }

    if (num > maxBalance) {
      setAmountError(`Max ${formatCurrency(maxBalance)}`);
      return;
    }

    updatePendingAmount(num);
    setAmountError("");
    setIsEditingAmount(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") validateAndSave();
    if (e.key === "Escape") {
      setIsEditingAmount(false);
      setAmountError("");
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: '#0A0A0A' }}>
        <SkeletonLoader variant="balance" />
      </div>
    );
  }

  if (!isAuthenticated || !pendingPayment) return null;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div
        ref={containerRef}
        className="flex flex-col min-h-dvh relative overflow-hidden"
        style={{
          background: "#0A0A0A",
        }}
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
              "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.06), transparent 50%), radial-gradient(circle at 80% 20%, rgba(204, 255, 0, 0.03), transparent 40%)",
          }}
          aria-hidden="true"
        />

        {/* Subtle particle field */}
        <ParticleField count={8} color="rgba(204, 255, 0, 0.1)" />

        {/* Content wrapper */}
        <div className="relative z-10" style={{ padding: "24px" }}>
          <AnimatePresence mode="wait">
            {/* ═══════════ CONFIRM STATE ═══════════ */}
            {state === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
                className="flex flex-col flex-1"
              >
                {/* Back button - Clean minimal style */}
                <motion.button
                  onClick={() => router.back()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mb-8 flex items-center gap-2"
                  style={{
                    background: "rgba(24, 24, 27, 0.8)",
                    border: "1px solid rgba(39, 39, 42, 0.6)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    width: "fit-content",
                  }}
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-4 h-4" style={{ color: "#CCFF00" }} />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#FFFFFF",
                    }}
                  >
                    Back
                  </span>
                </motion.button>

                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="mb-8"
                >
                  <motion.h1
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Confirm
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "15px",
                      color: "#71717A",
                      marginTop: "4px",
                    }}
                  >
                    Review your payment
                  </motion.p>
                </motion.div>

                {/* ── Clean Merchant Card ── */}
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="mb-6"
                    style={{
                      background: "rgba(24, 24, 27, 0.8)",
                      border: "1px solid rgba(39, 39, 42, 0.6)",
                      borderRadius: "20px",
                      padding: "32px 24px",
                    }}
                  >
                    {/* Merchant info row */}
                    <div className="flex items-center gap-4 mb-6">
                      {/* Merchant Avatar - Clean and simple */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl"
                        style={{
                          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))",
                          border: "1px solid rgba(99, 102, 241, 0.2)",
                        }}
                      >
                        <span role="img" aria-label={pendingPayment.name}>
                          {pendingPayment.avatar}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h2 
                            style={{
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontSize: "18px",
                              fontWeight: 600,
                              color: "#FFFFFF",
                            }}
                          >
                            {pendingPayment.name}
                          </h2>
                          {pendingPayment.verified && (
                            <BadgeCheck
                              className="w-4 h-4"
                              style={{ color: "#CCFF00" }}
                              aria-label="Verified merchant"
                            />
                          )}
                        </div>
                        <p 
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "11px",
                            color: "#52525B",
                            marginTop: "2px",
                          }}
                        >
                          {pendingPayment.address.slice(0, 8)}...{pendingPayment.address.slice(-4)}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div 
                      className="mb-6" 
                      style={{ 
                        height: "1px", 
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" 
                      }} 
                    />

                    {/* Amount - Hero Element */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }}
                      className="text-center"
                    >
                      {isEditingAmount ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative flex items-center justify-center">
                            <span 
                              style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "48px",
                                fontWeight: 700,
                                color: "#FFFFFF",
                              }}
                            >$</span>
                            <input
                              ref={inputRef}
                              type="text"
                              inputMode="decimal"
                              value={editValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*\.?\d{0,2}$/.test(val) || val === "") {
                                  setEditValue(val);
                                  setAmountError("");
                                }
                              }}
                              onKeyDown={handleEditKeyDown}
                              onBlur={validateAndSave}
                              className="bg-transparent outline-none text-center"
                              style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "48px",
                                fontWeight: 700,
                                color: "#FFFFFF",
                                width: "200px",
                              }}
                              aria-label="Edit payment amount"
                            />
                          </div>
                          {amountError && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-medium flex items-center gap-1"
                              style={{ color: "#f43f5e" }}
                            >
                              <AlertCircle className="w-3 h-3" />
                              {amountError}
                            </motion.p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={startEditing}
                          className="group cursor-pointer focus-ring rounded-xl px-4 py-2 -mx-4 transition-colors hover:bg-white/[0.03]"
                          aria-label="Tap to edit payment amount"
                        >
                          <h3 
                            style={{
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontSize: "48px",
                              fontWeight: 700,
                              color: "#FFFFFF",
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {formatCurrency(pendingPayment.amount)}
                          </h3>
                          <p 
                            className="text-sm flex items-center justify-center gap-1.5 mt-1"
                            style={{ color: "#71717A" }}
                          >
                            {pendingPayment.token}
                            <Pencil className="w-3 h-3 opacity-30 group-hover:opacity-60 transition-opacity" />
                          </p>
                        </button>
                      )}
                    </motion.div>
                  </motion.div>
                </ErrorBoundary>

                {/* ── AI Verification - Clean Badge ── */}
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                    className="flex items-center gap-3 px-4 py-3 mb-4"
                    style={{
                      background: aiVerified 
                        ? "rgba(34, 197, 94, 0.08)" 
                        : "rgba(245, 158, 11, 0.08)",
                      border: aiVerified 
                        ? "1px solid rgba(34, 197, 94, 0.15)" 
                        : "1px solid rgba(245, 158, 11, 0.15)",
                      borderRadius: "12px",
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: aiVerified 
                          ? "rgba(34, 197, 94, 0.15)" 
                          : "rgba(245, 158, 11, 0.15)",
                      }}
                    >
                      {aiVerified ? (
                        <ShieldCheck className="w-4 h-4" style={{ color: "#22c55e" }} />
                      ) : (
                        <Sparkles className="w-4 h-4" style={{ color: "#f59e0b" }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p 
                        className="text-sm font-medium flex items-center gap-1.5"
                        style={{ color: aiVerified ? "#22c55e" : "#f59e0b" }}
                      >
                        {aiVerified ? "AI Verified" : "Checking..."}
                        {aiVerified && (
                          <Sparkles className="w-3 h-3 opacity-60" aria-hidden="true" />
                        )}
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: "#52525B" }}
                      >
                        {aiReason || "Analyzing transaction..."}
                      </p>
                    </div>
                  </motion.div>
                </ErrorBoundary>

                {/* ── Fee Breakdown - Clean & Minimal ── */}
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                    style={{
                      background: "rgba(24, 24, 27, 0.6)",
                      border: "1px solid rgba(39, 39, 42, 0.4)",
                      borderRadius: "14px",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setShowFees(!showFees)}
                      className="w-full flex items-center justify-between px-4 py-3 cursor-pointer focus-ring"
                      aria-expanded={showFees}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" style={{ color: "#22c55e" }} />
                        <span style={{ color: "#A1A1AA", fontSize: "14px" }}>
                          Total
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-semibold font-numeric"
                          style={{ color: "#FFFFFF", fontSize: "14px" }}
                        >
                          {formatCurrency(pendingPayment.amount + 0.01)}
                        </span>
                        <motion.div
                          animate={{ rotate: showFees ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4" style={{ color: "#52525B" }} />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {showFees && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div 
                            className="px-4 pb-3 space-y-2"
                            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                          >
                            <div className="flex justify-between py-2">
                              <span style={{ color: "#71717A", fontSize: "13px" }}>Network Gas</span>
                              <span style={{ color: "#22c55e", fontSize: "13px" }}>Sponsored</span>
                            </div>
                            <div className="flex justify-between py-2">
                              <span style={{ color: "#71717A", fontSize: "13px" }}>Service Fee</span>
                              <span style={{ color: "#A1A1AA", fontSize: "13px" }}>$0.01</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </ErrorBoundary>

                {/* Slide to Pay */}
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex justify-center mt-auto"
                  >
                    <div className="w-full max-w-[340px]">
                      <SlideToPay onComplete={handlePayment} />
                    </div>
                  </motion.div>
                </ErrorBoundary>

                {/* Security note */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center text-xs flex items-center justify-center gap-1.5 mt-4"
                  style={{ color: "#52525B" }}
                >
                  <Wallet className="w-3 h-3" />
                  Secured by Vessel
                </motion.p>
              </motion.div>
            )}

            {/* ═══════════ PROCESSING STATE ═══════════ */}
            {state === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(6px)" }}
                className="flex-1 flex flex-col items-center justify-center gap-8 py-20"
                role="status"
                aria-label="Processing payment"
              >
                {/* Spinner */}
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="w-12 h-12" style={{ color: "#6366f1" }} />
                  </motion.div>
                  {/* Outer pulsing ring */}
                  <motion.div
                    className="absolute -inset-5 rounded-full"
                    style={{ border: "1px solid rgba(99, 102, 241, 0.1)" }}
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    aria-hidden="true"
                  />
                </div>

                <div className="text-center">
                  <h2 
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "#FFFFFF",
                    }}
                  >
                    Sending
                  </h2>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: "#71717A" }}
                  >
                    {formatCurrency(pendingPayment.amount)} to {pendingPayment.name}
                  </p>
                </div>

                {/* Animated dots */}
                <div className="flex gap-2" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ background: "rgba(99, 102, 241, 0.7)" }}
                      animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══════════ SUCCESS STATE ═══════════ */}
            {state === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 18, stiffness: 120 }}
                className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-8"
              >
                {/* Success Checkmark */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    damping: 14,
                    stiffness: 180,
                    delay: 0.1,
                  }}
                  className="relative"
                >
                  {/* Outer glow */}
                  <motion.div
                    className="absolute -inset-8 rounded-full opacity-25"
                    style={{
                      background: "radial-gradient(circle, rgba(34,197,94,0.3), transparent 70%)",
                    }}
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.2, 0.35, 0.2],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    aria-hidden="true"
                  />

                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.05))",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                      boxShadow: "0 0 32px rgba(34, 197, 94, 0.15), 0 0 64px rgba(34, 197, 94, 0.06)",
                    }}
                  >
                    <Check className="w-10 h-10" style={{ color: "#22c55e", strokeWidth: 3 }} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-center"
                >
                  <h2 
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "26px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                    }}
                  >
                    Sent
                  </h2>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: "#71717A" }}
                  >
                    {formatCurrency(pendingPayment.amount)} {pendingPayment.token}
                  </p>
                </motion.div>

                {/* To/From info */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{
                    background: "rgba(24, 24, 27, 0.6)",
                    border: "1px solid rgba(39, 39, 42, 0.4)",
                    borderRadius: "12px",
                  }}
                >
                  <span style={{ color: "#52525B", fontSize: "12px" }}>to</span>
                  <span style={{ color: "#FFFFFF", fontSize: "14px", fontWeight: 500 }}>
                    {pendingPayment.name}
                  </span>
                  {pendingPayment.verified && (
                    <BadgeCheck className="w-4 h-4" style={{ color: "#CCFF00" }} />
                  )}
                </motion.div>

                {/* Tx Hash */}
                <motion.a
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  href="#"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl group"
                  style={{
                    background: "rgba(24, 24, 27, 0.6)",
                    border: "1px solid rgba(39, 39, 42, 0.4)",
                  }}
                >
                  <span 
                    className="text-xs font-mono"
                    style={{ color: "#52525B" }}
                  >
                    0xf6760d52...ab12e5ce
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" style={{ color: "#52525B" }} />
                </motion.a>

                {/* Done Button */}
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  onClick={() => router.push("/wallet")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full max-w-[280px] py-4 rounded-xl font-semibold text-[15px] mt-2"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 16px rgba(99, 102, 241, 0.25)",
                  }}
                >
                  Done
                </motion.button>
              </motion.div>
            )}

            {/* ═══════════ ERROR STATE ═══════════ */}
            {state === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 18 }}
                className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-10"
                role="alert"
              >
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(244, 63, 94, 0.05))",
                    border: "1px solid rgba(244, 63, 94, 0.2)",
                  }}
                >
                  <AlertCircle className="w-10 h-10" style={{ color: "#f43f5e" }} />
                </div>

                <div className="text-center">
                  <h2 
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "#FFFFFF",
                    }}
                  >
                    Failed
                  </h2>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: "#71717A" }}
                  >
                    Transaction could not be completed
                  </p>
                </div>

                <motion.button
                  onClick={() => setState("confirm")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full max-w-[260px] py-4 rounded-xl font-semibold text-[15px]"
                  style={{
                    background: "linear-gradient(135deg, #f43f5e, #e11d48)",
                    color: "#FFFFFF",
                  }}
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PullToRefresh>
  );
}

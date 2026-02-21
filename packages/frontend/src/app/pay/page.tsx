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
      checkFraud(pendingPayment.amount, pendingPayment.address).then(
        (result) => {
          setAiVerified(result.approved);
          setAiReason(result.reason);
        }
      );
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
              "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08), transparent 50%), radial-gradient(circle at 80% 20%, rgba(204, 255, 0, 0.04), transparent 40%)",
          }}
          aria-hidden="true"
        />

        {/* Enhanced particle field */}
        <ParticleField count={15} color="rgba(204, 255, 0, 0.15)" />

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
                className="flex flex-col flex-1 pt-6"
              >
                {/* Back button - Premium style */}
                <motion.button
                  onClick={() => router.back()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="mb-6 flex items-center gap-2 group"
                  style={{
                    background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
                    border: "1px solid rgba(39, 39, 42, 0.8)",
                    borderRadius: "16px",
                    padding: "10px 16px",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                  aria-label="Go back"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#CCFF00"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform group-hover:-translate-x-1"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#FFFFFF",
                    }}
                  >
                    Back
                  </span>
                </motion.button>

                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="mb-8"
                >
                  <motion.h1
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "clamp(20px, 4vw, 24px)",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      letterSpacing: "-0.02em",
                      marginBottom: "4px",
                    }}
                  >
                    Confirm Payment
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      color: "#71717A",
                      fontWeight: 500,
                    }}
                  >
                    Review and confirm your transaction
                  </motion.p>
                </motion.div>

                {/* ── Merchant Card ── */}
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.1, type: "spring", damping: 22 }}
                    className="relative overflow-hidden mb-4"
                    style={{
                      background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
                      border: "1px solid rgba(39, 39, 42, 0.8)",
                      borderRadius: "24px",
                      padding: "28px",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {/* Ambient glow effect */}
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

                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(204, 255, 0, 0.03) 50%, transparent 100%)",
                        backgroundSize: "200% 100%",
                      }}
                      animate={{
                        backgroundPosition: ["0% 0%", "200% 0%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      aria-hidden="true"
                    />

                    {/* Decorative background */}
                    <div
                      className="absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-10 pointer-events-none"
                      style={{
                        background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)",
                      }}
                      aria-hidden="true"
                    />
                    <div
                      className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full opacity-10 pointer-events-none"
                      style={{
                        background: "radial-gradient(circle, rgba(6,214,160,0.5), transparent 70%)",
                      }}
                      aria-hidden="true"
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Merchant Avatar */}
                      <motion.div
                        className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl relative"
                        style={{
                          background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
                          border: "1px solid rgba(39, 39, 42, 0.8)",
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                        }}
                        animate={{
                          boxShadow: [
                            "0 0 16px rgba(99,102,241,0.08)",
                            "0 0 28px rgba(99,102,241,0.16)",
                            "0 0 16px rgba(99,102,241,0.08)",
                          ],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <span role="img" aria-label={pendingPayment.name}>
                          {pendingPayment.avatar}
                        </span>
                      </motion.div>

                      <div className="flex items-center justify-center gap-2 mb-1">
                        <h2 
                          className="text-[17px] font-bold"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            color: "#FFFFFF",
                          }}
                        >
                          {pendingPayment.name}
                        </h2>
                        {pendingPayment.verified && (
                          <BadgeCheck
                            className="w-5 h-5 text-[#CCFF00]"
                            aria-label="Verified merchant"
                          />
                        )}
                      </div>

                      <p 
                        className="text-[11px] text-center mb-5 font-mono tracking-wider"
                        style={{
                          color: "#52525B",
                        }}
                      >
                        {pendingPayment.address.slice(0, 10)}...
                        {pendingPayment.address.slice(-6)}
                      </p>

                      {/* Amount — Editable Hero Display */}
                      <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 180, delay: 0.2 }}
                      >
                        {isEditingAmount ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative inline-flex items-center">
                              <span 
                                className="text-display text-gradient mr-1"
                                style={{
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  fontSize: "clamp(2rem, 5vw, 2.5rem)",
                                  fontWeight: 800,
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
                                className="text-display text-gradient bg-transparent outline-none w-[180px] text-center font-numeric"
                                style={{
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  fontSize: "clamp(2rem, 5vw, 2.5rem)",
                                  fontWeight: 800,
                                }}
                                aria-label="Edit payment amount"
                              />
                            </div>
                            {amountError && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[12px] font-medium flex items-center gap-1"
                                style={{ color: "#f43f5e" }}
                              >
                                <AlertCircle className="w-4 h-4" />
                                {amountError}
                              </motion.p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={startEditing}
                            className="group cursor-pointer focus-ring rounded-xl px-4 py-2 -mx-4 -my-2 transition-colors hover:bg-white/[0.03]"
                            aria-label="Tap to edit payment amount"
                          >
                            <h3 
                              className="text-gradient mb-1 inline-flex items-center gap-2"
                              style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "clamp(2rem, 5vw, 2.5rem)",
                                fontWeight: 800,
                              }}
                            >
                              {formatCurrency(pendingPayment.amount)}
                              <Pencil className="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                            </h3>
                            <p 
                              className="text-[13px]"
                              style={{ color: "#71717A" }}
                            >
                              {pendingPayment.token}
                            </p>
                          </button>
                        )}
                      </motion.div>
                    </div>

                    {/* Corner accents */}
                    <div
                      className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none"
                      style={{
                        background: "radial-gradient(circle at top right, #CCFF00, transparent 70%)",
                      }}
                      aria-hidden="true"
                    />
                  </motion.div>
                </ErrorBoundary>

                {/* ── AI Verification Badge ── */}
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: aiVerified ? 1 : 0.4, y: 0 }}
                    transition={{ delay: 0.7, type: "spring", damping: 20 }}
                    className="flex items-center gap-3 p-4 mb-3"
                    style={{
                      background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
                      border: "1px solid rgba(39, 39, 42, 0.8)",
                      borderRadius: "16px",
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
                        border: "1px solid rgba(34, 197, 94, 0.2)",
                      }}
                    >
                      <ShieldCheck className="w-5 h-5 text-[#22c55e]" />
                    </div>
                    <div className="flex-1">
                      <p 
                        className="text-[13px] font-semibold flex items-center gap-1.5"
                        style={{ color: "#22c55e" }}
                      >
                        AI Verified
                        <Sparkles
                          className="w-3.5 h-3.5 opacity-60"
                          aria-hidden="true"
                        />
                      </p>
                      <p 
                        className="text-[11px]"
                        style={{ color: "#52525B" }}
                      >
                        {aiReason}
                      </p>
                    </div>
                  </motion.div>
                </ErrorBoundary>

                {/* ── Fee Breakdown ── */}
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="overflow-hidden mb-6"
                    style={{
                      background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
                      border: "1px solid rgba(39, 39, 42, 0.8)",
                      borderRadius: "16px",
                    }}
                  >
                    <button
                      onClick={() => setShowFees(!showFees)}
                      className="w-full flex items-center justify-between p-4 cursor-pointer focus-ring"
                      aria-expanded={showFees}
                    >
                      <span 
                        className="text-[13px]"
                        style={{ color: "#71717A" }}
                      >
                        Fee Breakdown
                      </span>
                      <motion.div
                        animate={{ rotate: showFees ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {showFees && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            <div className="flex justify-between text-[13px]">
                              <span className="flex items-center gap-2" style={{ color: "#71717A" }}>
                                <Zap className="w-3.5 h-3.5 text-[#22c55e]/60" aria-hidden="true" />
                                Network Gas
                              </span>
                              <span className="font-semibold" style={{ color: "#22c55e" }}>
                                $0.00{" "}
                                <span className="text-[10px] opacity-50">Sponsored</span>
                              </span>
                            </div>
                            <div className="flex justify-between text-[13px]">
                              <span style={{ color: "#71717A" }}>Service Fee</span>
                              <span className="font-numeric" style={{ color: "#A1A1AA" }}>$0.01</span>
                            </div>
                            <div 
                              className="border-t border-white/[0.05] pt-3 flex justify-between text-[14px] font-semibold"
                              style={{ color: "#FFFFFF" }}
                            >
                              <span>Total</span>
                              <span className="font-numeric">
                                {formatCurrency(pendingPayment.amount + 0.01)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </ErrorBoundary>

                {/* Slide to Pay with MovingBorder */}
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="flex justify-center mt-auto pt-4 mb-4"
                  >
                    <MovingBorder
                      duration={2000}
                      containerClassName="w-full max-w-[320px]"
                      borderClassName="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06d6a0]"
                    >
                      <div className="w-full" style={{ padding: "4px" }}>
                        <SlideToPay onComplete={handlePayment} />
                      </div>
                    </MovingBorder>
                  </motion.div>
                </ErrorBoundary>

                {/* Security note */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center text-[11px] flex items-center justify-center gap-1.5"
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
                    <Loader2 className="w-14 h-14 text-primary/80" />
                  </motion.div>
                  {/* Outer pulsing ring */}
                  <motion.div
                    className="absolute -inset-4 rounded-full"
                    style={{ border: "1px solid rgba(99, 102, 241, 0.1)" }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    aria-hidden="true"
                  />
                </div>

                <div className="text-center">
                  <h2 
                    className="mb-2"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                    }}
                  >
                    Processing
                  </h2>
                  <p 
                    className="text-[14px]"
                    style={{ color: "#71717A" }}
                  >
                    Submitting to Lisk network...
                  </p>
                </div>

                {/* Animated dots */}
                <div className="flex gap-2" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary/70"
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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 90 }}
                className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-10"
              >
                {/* Success Checkmark */}
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    damping: 12,
                    stiffness: 150,
                    delay: 0.15,
                  }}
                  className="relative"
                >
                  {/* Outer glow */}
                  <motion.div
                    className="absolute -inset-6 rounded-full opacity-30"
                    style={{
                      background: "radial-gradient(circle, rgba(34,197,94,0.4), transparent 70%)",
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    aria-hidden="true"
                  />

                  <div 
                    className="w-28 h-28 rounded-full flex items-center justify-center glow-success relative"
                    style={{
                      background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                      boxShadow: "0 0 24px rgba(34, 197, 94, 0.15), 0 0 48px rgba(34, 197, 94, 0.08)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-14 h-14" aria-hidden="true">
                      <motion.path
                        d="M5 13l4 4L19 7"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 0.7,
                          delay: 0.35,
                          ease: "easeOut",
                        }}
                      />
                    </svg>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <h2 
                    className="mb-1"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                    }}
                  >
                    Payment Sent!
                  </h2>
                  <p 
                    className="text-[14px]"
                    style={{ color: "#71717A" }}
                  >
                    {formatCurrency(pendingPayment.amount)} {pendingPayment.token} → {pendingPayment.name}
                  </p>
                </motion.div>

                {/* Tx Hash */}
                <motion.a
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  href="#"
                  className="flex items-center gap-2.5 px-5 py-3 rounded-2xl group"
                  style={{
                    background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
                    border: "1px solid rgba(39, 39, 42, 0.8)",
                  }}
                >
                  <span 
                    className="text-[12px] font-mono tracking-wider"
                    style={{ color: "#52525B" }}
                  >
                    0xf6760d52...ab12e5ce
                  </span>
                  <ExternalLink className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors" />
                </motion.a>

                {/* Done Button */}
                <MovingBorder
                  duration={2000}
                  containerClassName="w-full max-w-[300px] mt-4"
                  borderClassName="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06d6a0]"
                >
                  <motion.button
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    onClick={() => router.push("/wallet")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-[18px] rounded-2xl text-white font-semibold text-[15px]"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06d6a0)",
                    }}
                  >
                    Back to Wallet
                  </motion.button>
                </MovingBorder>
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
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(244, 63, 94, 0.05))",
                    border: "1px solid rgba(244, 63, 94, 0.2)",
                  }}
                >
                  <AlertCircle className="w-12 h-12 text-[#f43f5e]/80" />
                </div>

                <div className="text-center">
                  <h2 
                    className="mb-1"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                    }}
                  >
                    Payment Failed
                  </h2>
                  <p 
                    className="text-[14px]"
                    style={{ color: "#71717A" }}
                  >
                    Transaction could not be completed. Please try again.
                  </p>
                </div>

                <MovingBorder
                  duration={2000}
                  containerClassName="w-full max-w-[300px]"
                  borderClassName="bg-gradient-to-r from-[#f43f5e] via-[#f43f5e] to-[#f43f5e]"
                >
                  <motion.button
                    onClick={() => setState("confirm")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-[18px] rounded-2xl text-white font-semibold text-[15px]"
                    style={{
                      background: "linear-gradient(135deg, #f43f5e, #e11d48, #f43f5e)",
                    }}
                  >
                    Try Again
                  </motion.button>
                </MovingBorder>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PullToRefresh>
  );
}

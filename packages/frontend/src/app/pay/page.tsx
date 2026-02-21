"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { checkFraud } from "@/lib/fraud-check";
import SlideToPay from "@/components/slide-to-pay";
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
    const colors = ["#6366f1", "#06d6a0", "#8b5cf6", "#22c55e", "#818cf8"];

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 2,
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
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: '#A1A1AA', fontFamily: "'Inter', sans-serif" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !pendingPayment) return null;

  return (
    <div className="flex flex-col min-h-dvh px-5 pt-safe pb-8">
      <AnimatePresence mode="wait">
        {/* ═══════════ CONFIRM STATE ═══════════ */}
        {state === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
            className="flex flex-col flex-1 pt-10"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
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
                <h1 className="text-h3">Confirm Payment</h1>
                <p className="text-[11px] text-muted-foreground/50">
                  Review details below
                </p>
              </div>
            </div>

            {/* ── Merchant Card ── */}
            <motion.div
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.1, type: "spring", damping: 22 }}
              className="glass-strong p-7 mb-4 text-center relative overflow-hidden"
            >
              {/* Decorative background */}
              <div
                className="absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-15 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)",
                }}
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full opacity-10 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(6,214,160,0.5), transparent 70%)",
                }}
                aria-hidden="true"
              />

              {/* Merchant Avatar */}
              <motion.div
                className="w-16 h-16 rounded-2xl glass-md mx-auto mb-4 flex items-center justify-center text-2xl relative"
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

              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <h2 className="text-[15px] font-bold">
                  {pendingPayment.name}
                </h2>
                {pendingPayment.verified && (
                  <BadgeCheck
                    className="w-4 h-4 text-primary"
                    aria-label="Verified merchant"
                  />
                )}
              </div>

              <p className="text-[11px] text-muted-foreground/40 mb-5 font-mono tracking-wider">
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
                      <span className="text-display text-gradient mr-1">$</span>
                      <input
                        ref={inputRef}
                        type="text"
                        inputMode="decimal"
                        value={editValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Allow only numbers and one decimal point
                          if (/^\d*\.?\d{0,2}$/.test(val) || val === "") {
                            setEditValue(val);
                            setAmountError("");
                          }
                        }}
                        onKeyDown={handleEditKeyDown}
                        onBlur={validateAndSave}
                        className="text-display text-gradient bg-transparent outline-none w-[160px] text-center font-numeric caret-primary"
                        aria-label="Edit payment amount"
                      />
                    </div>
                    {amountError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] text-danger font-medium flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {amountError}
                      </motion.p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={startEditing}
                    className="group cursor-pointer focus-ring rounded-xl px-3 py-1 -mx-3 -my-1 transition-colors hover:bg-white/[0.03]"
                    aria-label="Tap to edit payment amount"
                  >
                    <h3 className="text-display text-gradient mb-0.5 inline-flex items-center gap-2">
                      {formatCurrency(pendingPayment.amount)}
                      <Pencil className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                    </h3>
                    <p className="text-caption text-muted-foreground/50">
                      {pendingPayment.token}
                    </p>
                  </button>
                )}
              </motion.div>
            </motion.div>

            {/* ── AI Verification Badge ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: aiVerified ? 1 : 0.4, y: 0 }}
              transition={{ delay: 0.7, type: "spring", damping: 20 }}
              className="glass gradient-border flex items-center gap-3 p-3.5 mb-3"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-success/15 to-success/[0.05] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-success flex items-center gap-1.5">
                  AI Verified
                  <Sparkles
                    className="w-3 h-3 opacity-60"
                    aria-hidden="true"
                  />
                </p>
                <p className="text-[10px] text-muted-foreground/50">
                  {aiReason}
                </p>
              </div>
            </motion.div>

            {/* ── Fee Breakdown ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass mb-6 overflow-hidden"
            >
              <button
                onClick={() => setShowFees(!showFees)}
                className="w-full flex items-center justify-between p-3.5 text-[12px] cursor-pointer focus-ring"
                aria-expanded={showFees}
              >
                <span className="text-muted-foreground/60">
                  Fee Breakdown
                </span>
                <motion.div
                  animate={{ rotate: showFees ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />
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
                    <div className="px-3.5 pb-3.5 space-y-2.5">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-muted-foreground/50 flex items-center gap-1.5">
                          <Zap
                            className="w-3 h-3 text-success/60"
                            aria-hidden="true"
                          />
                          Network Gas
                        </span>
                        <span className="text-success font-semibold">
                          $0.00{" "}
                          <span className="text-success/50 text-[10px]">
                            Sponsored
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-muted-foreground/50">
                          Service Fee
                        </span>
                        <span className="text-muted-foreground/70 font-numeric">
                          $0.01
                        </span>
                      </div>
                      <div className="border-t border-white/[0.05] pt-2.5 flex justify-between text-[12px] font-semibold">
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

            {/* Slide to Pay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="flex justify-center mt-auto pt-8 mb-6"
            >
              <SlideToPay onComplete={handlePayment} />
            </motion.div>
          </motion.div>
        )}

        {/* ═══════════ PROCESSING STATE ═══════════ */}
        {state === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(6px)" }}
            className="flex-1 flex flex-col items-center justify-center gap-8"
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
                <Loader2 className="w-12 h-12 text-primary/80" />
              </motion.div>
              {/* Outer pulsing ring */}
              <motion.div
                className="absolute -inset-3 rounded-full border border-primary/10"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                aria-hidden="true"
              />
            </div>

            <div className="text-center">
              <h2 className="text-h2 mb-2">Processing</h2>
              <p className="text-body text-muted-foreground/60">
                Submitting to Lisk network...
              </p>
            </div>

            {/* Animated dots */}
            <div className="flex gap-2" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary/70"
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
            className="flex-1 flex flex-col items-center justify-center gap-6 px-4"
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
                className="absolute -inset-4 rounded-full opacity-30"
                style={{
                  background:
                    "radial-gradient(circle, rgba(34,197,94,0.4), transparent 70%)",
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                aria-hidden="true"
              />

              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success/15 to-success/[0.05] border border-success/20 flex items-center justify-center glow-success relative">
                <svg viewBox="0 0 24 24" className="w-12 h-12" aria-hidden="true">
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
              <h2 className="text-h1 mb-1">Payment Sent!</h2>
              <p className="text-body text-muted-foreground/60">
                {formatCurrency(pendingPayment.amount)}{" "}
                {pendingPayment.token} → {pendingPayment.name}
              </p>
            </motion.div>

            {/* Tx Hash */}
            <motion.a
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              href="#"
              className="glass gradient-border flex items-center gap-2.5 px-4 py-3 rounded-2xl group focus-ring"
            >
              <span className="text-[11px] text-muted-foreground/50 font-mono tracking-wider">
                0xf6760d52...ab12e5ce
              </span>
              <ExternalLink className="w-3 h-3 text-primary/50 group-hover:text-primary transition-colors" />
            </motion.a>

            {/* Done Button */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              onClick={() => router.push("/wallet")}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-[300px] py-[18px] rounded-2xl text-white font-semibold text-[15px] mt-4 btn-magnetic relative overflow-hidden focus-ring"
              style={{
                background:
                  "linear-gradient(135deg, #6366f1, #8b5cf6, #06d6a0)",
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty(
                  "--mouse-x",
                  `${((e.clientX - rect.left) / rect.width) * 100}%`
                );
                e.currentTarget.style.setProperty(
                  "--mouse-y",
                  `${((e.clientY - rect.top) / rect.height) * 100}%`
                );
              }}
            >
              Back to Wallet
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
            className="flex-1 flex flex-col items-center justify-center gap-6 px-4"
            role="alert"
          >
            <div className="w-20 h-20 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-danger/80" />
            </div>

            <div className="text-center">
              <h2 className="text-h2 mb-1">Payment Failed</h2>
              <p className="text-body text-muted-foreground/60">
                Transaction could not be completed. Please try again.
              </p>
            </div>

            <motion.button
              onClick={() => setState("confirm")}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-[300px] py-[18px] rounded-2xl text-white font-semibold text-[15px] btn-magnetic relative overflow-hidden focus-ring"
              style={{
                background:
                  "linear-gradient(135deg, #6366f1, #8b5cf6, #06d6a0)",
              }}
            >
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

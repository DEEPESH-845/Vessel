"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { checkFraud } from "@/lib/fraud-check";
import PullToRefresh from "@/components/pull-to-refresh";
import SkeletonLoader from "@/components/skeleton-loader";
import ErrorBoundary from "@/components/error-boundary";
import ParticleField from "@/components/particle-field";
import ScrollProgress from "@/components/scroll-progress";

// Import our premium components
import PaymentHeader from "./_components/PaymentHeader";
import MerchantCard from "./_components/MerchantCard";
import AmountSection from "./_components/AmountSection";
import AIVerificationBadge from "./_components/AIVerificationBadge";
import FeeBreakdown from "./_components/FeeBreakdown";
import PaymentSlider from "./_components/PaymentSlider";
import ProcessingState from "./_components/ProcessingState";
import SuccessState from "./_components/SuccessState";
import ErrorState from "./_components/ErrorState";
import PremiumBackground from "./_components/PremiumBackground";

import { useEffect, useState, useCallback } from "react";

type PaymentState = "confirm" | "processing" | "success" | "error";

export default function PayPage() {
  const router = useRouter();
  const { pendingPayment, updatePendingAmount, addTransaction, balances } = useApp();
  const [state, setState] = useState<PaymentState>("confirm");
  const [aiVerified, setAiVerified] = useState(false);
  const [aiReason, setAiReason] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // Redirect if no pending payment
  useEffect(() => {
    if (isAuthenticated && !pendingPayment) {
      router.replace("/wallet");
    }
  }, [isAuthenticated, pendingPayment, router]);

  // AI Fraud check
  useEffect(() => {
    if (pendingPayment) {
      const result = checkFraud({ 
        amount: pendingPayment.amount, 
        address: pendingPayment.address, 
        velocity: 0, 
        avgAmount: 0, 
        countryRisk: 0, 
        sessionAge: 10 
      });
      setAiVerified(result.approved);
      setAiReason(result.reason);
    }
  }, [pendingPayment]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  // Handle payment submission
  const handlePayment = useCallback(async () => {
    setState("processing");
    
    // Simulate blockchain confirmation
    await new Promise((resolve) => setTimeout(resolve, 2500));

    if (pendingPayment) {
      addTransaction({
        id: Date.now().toString(),
        merchant: pendingPayment.name,
        amount: pendingPayment.amount,
        token: pendingPayment.token,
        timestamp: "Just now",
        status: "completed",
        txHash: "0xf6760d52e4a1234567890abcdef123456789abcdef",
      });
    }

    setState("success");
  }, [pendingPayment, addTransaction]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setState("confirm");
  }, []);

  // Handle done
  const handleDone = useCallback(() => {
    router.push("/wallet");
  }, [router]);

  // Handle amount change
  const handleAmountChange = useCallback((newAmount: number) => {
    updatePendingAmount(newAmount);
  }, [updatePendingAmount]);

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
      <PremiumBackground>
        {/* Scroll progress indicator */}
        <ScrollProgress />
        
        {/* Particle field */}
        <ParticleField count={12} color="rgba(204, 255, 0, 0.08)" />

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
                transition={{ duration: 0.4 }}
                className="flex flex-col flex-1"
              >
                {/* Header */}
                <PaymentHeader onBack={() => router.back()} />

                {/* Page Title */}
                <motion.div
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mb-6 mt-2"
                >
                  <h1
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "30px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Confirm
                  </h1>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "15px",
                      color: "#71717A",
                      marginTop: "4px",
                    }}
                  >
                    Review your payment
                  </p>
                </motion.div>

                {/* Merchant Card */}
                <ErrorBoundary>
                  <div className="mb-6">
                    <MerchantCard
                      name={pendingPayment.name}
                      address={pendingPayment.address}
                      avatar={pendingPayment.avatar}
                      verified={pendingPayment.verified}
                    />
                  </div>
                </ErrorBoundary>

                {/* Amount Section */}
                <ErrorBoundary>
                  <div className="mb-6" style={{ padding: "0 20px" }}>
                    <AmountSection
                      amount={pendingPayment.amount}
                      token={pendingPayment.token}
                      maxBalance={maxBalance}
                      onAmountChange={handleAmountChange}
                    />
                  </div>
                </ErrorBoundary>

                {/* AI Verification Badge */}
                <ErrorBoundary>
                  <div className="mb-6">
                    <AIVerificationBadge
                      verified={aiVerified}
                      reason={aiReason}
                    />
                  </div>
                </ErrorBoundary>

                {/* Fee Breakdown */}
                <ErrorBoundary>
                  <div className="mb-8">
                    <FeeBreakdown
                      amount={pendingPayment.amount}
                      gasSponsored={true}
                      serviceFee={0.01}
                    />
                  </div>
                </ErrorBoundary>

                {/* Payment Slider */}
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-center mt-auto"
                  >
                    <div className="w-full max-w-[360px]">
                      <PaymentSlider 
                        onComplete={handlePayment} 
                        disabled={!aiVerified}
                      />
                    </div>
                  </motion.div>
                </ErrorBoundary>
              </motion.div>
            )}

            {/* ═══════════ PROCESSING STATE ═══════════ */}
            {state === "processing" && (
              <ProcessingState
                key="processing"
                amount={pendingPayment.amount}
                merchantName={pendingPayment.name}
              />
            )}

            {/* ═══════════ SUCCESS STATE ═══════════ */}
            {state === "success" && (
              <SuccessState
                key="success"
                amount={pendingPayment.amount}
                token={pendingPayment.token}
                merchantName={pendingPayment.name}
                merchantVerified={pendingPayment.verified}
                txHash="0xf6760d52e4a1234567890abcdef123456789abcdef"
                onDone={handleDone}
              />
            )}

            {/* ═══════════ ERROR STATE ═══════════ */}
            {state === "error" && (
              <ErrorState
                key="error"
                onRetry={handleRetry}
              />
            )}
          </AnimatePresence>
        </div>
      </PremiumBackground>
    </PullToRefresh>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { TOTAL_BALANCE, DEFAULT_TRANSACTIONS } from "@/lib/mock-data";
import BottomNav from "@/components/bottom-nav";
import ErrorBoundary from "@/components/error-boundary";
import PremiumBalanceCard from "@/components/premium-balance-card";
import PremiumQuickActions from "@/components/premium-quick-actions";
import PremiumTransactionsSection from "@/components/premium-transactions-section";
import ParticleField from "@/components/particle-field";
import ScrollProgress from "@/components/scroll-progress";
import PullToRefresh from "@/components/pull-to-refresh";
import SkeletonLoader from "@/components/skeleton-loader";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

export default function WalletPage() {
  const router = useRouter();
  const { isLoggedIn } = useApp();
  const { scrollY } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { impact, notification } = useHapticFeedback();

  // Parallax effect for background
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const backgroundOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  // GSAP scroll animations (only in browser)
  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    // Dynamically import GSAP only in browser
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          // Fade in sections on scroll
          gsap.utils.toArray<HTMLElement>(".scroll-reveal").forEach((element) => {
            gsap.from(element, {
              scrollTrigger: {
                trigger: element,
                start: "top 80%",
                end: "top 20%",
                toggleActions: "play none none reverse",
              },
              opacity: 0,
              y: 30,
              duration: 0.8,
              ease: "power2.out",
            });
          });
        }, containerRef);

        return () => ctx.revert();
      });
    });
  }, [isLoggedIn]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    impact("medium");
    
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    notification("success");
    setIsLoading(false);
  };

  if (!isLoggedIn) return null;

  // Get current time for greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div
        ref={containerRef}
        className="flex flex-col min-h-dvh pb-28 relative overflow-hidden"
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
          {/* Greeting header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mb-8"
          >
            <motion.h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(24px, 5vw, 28px)",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                marginBottom: "4px",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              {greeting}
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
              {isLoading ? "Refreshing..." : "Here's your wallet overview"}
            </motion.p>
          </motion.div>

          {/* Main content with bento grid layout */}
          <div
            className="flex flex-col"
            style={{
              gap: "24px",
            }}
          >
            {/* Balance Card */}
            <ErrorBoundary>
              <div className="scroll-reveal">
                {isLoading ? (
                  <SkeletonLoader variant="balance" />
                ) : (
                  <PremiumBalanceCard balance={TOTAL_BALANCE} />
                )}
              </div>
            </ErrorBoundary>

            {/* Quick Actions */}
            <ErrorBoundary>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.4,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="scroll-reveal"
              >
                {isLoading ? (
                  <div className="grid grid-cols-2" style={{ gap: "24px" }}>
                    <SkeletonLoader variant="card" />
                    <SkeletonLoader variant="card" />
                  </div>
                ) : (
                  <PremiumQuickActions />
                )}
              </motion.div>
            </ErrorBoundary>

            {/* Recent Transactions */}
            <ErrorBoundary>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.6,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="scroll-reveal"
              >
                {isLoading ? (
                  <SkeletonLoader variant="transaction" count={3} />
                ) : (
                  <PremiumTransactionsSection transactions={DEFAULT_TRANSACTIONS} />
                )}
              </motion.div>
            </ErrorBoundary>
          </div>

          {/* Scroll indicator (subtle hint) */}
          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.div
              animate={{
                y: [0, 8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#71717A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        <BottomNav />
      </div>
    </PullToRefresh>
  );
}

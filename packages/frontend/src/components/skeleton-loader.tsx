/**
 * SkeletonLoader Component
 * 
 * Animated skeleton screens for loading states
 * Provides visual feedback while content is loading
 */

"use client";

import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  variant?: "card" | "transaction" | "balance";
  count?: number;
}

export default function SkeletonLoader({ variant = "card", count = 1 }: SkeletonLoaderProps) {
  const shimmer = {
    backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)",
    backgroundSize: "200% 100%",
  };

  const BalanceSkeleton = () => (
    <motion.div
      className="relative overflow-hidden"
      style={{
        background: "rgba(24, 24, 27, 0.8)",
        border: "1px solid rgba(39, 39, 42, 0.8)",
        borderRadius: "24px",
        padding: "24px",
        height: "160px",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-0"
        style={shimmer}
        animate={{
          backgroundPosition: ["0% 0%", "200% 0%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <div className="relative z-10 space-y-4">
        <div
          className="h-4 w-32 rounded"
          style={{ background: "rgba(255, 255, 255, 0.1)" }}
        />
        <div
          className="h-10 w-48 rounded"
          style={{ background: "rgba(255, 255, 255, 0.15)" }}
        />
        <div
          className="h-3 w-24 rounded"
          style={{ background: "rgba(255, 255, 255, 0.08)" }}
        />
      </div>
    </motion.div>
  );

  const TransactionSkeleton = () => (
    <motion.div
      className="relative overflow-hidden"
      style={{
        background: "rgba(24, 24, 27, 0.8)",
        border: "1px solid rgba(39, 39, 42, 0.8)",
        borderRadius: "20px",
        padding: "16px",
        height: "72px",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-0"
        style={shimmer}
        animate={{
          backgroundPosition: ["0% 0%", "200% 0%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full"
            style={{ background: "rgba(255, 255, 255, 0.1)" }}
          />
          <div className="space-y-2">
            <div
              className="h-4 w-32 rounded"
              style={{ background: "rgba(255, 255, 255, 0.12)" }}
            />
            <div
              className="h-3 w-24 rounded"
              style={{ background: "rgba(255, 255, 255, 0.08)" }}
            />
          </div>
        </div>
        <div className="space-y-2 text-right">
          <div
            className="h-4 w-20 rounded ml-auto"
            style={{ background: "rgba(255, 255, 255, 0.12)" }}
          />
          <div
            className="h-3 w-16 rounded ml-auto"
            style={{ background: "rgba(255, 255, 255, 0.08)" }}
          />
        </div>
      </div>
    </motion.div>
  );

  const CardSkeleton = () => (
    <motion.div
      className="relative overflow-hidden"
      style={{
        background: "rgba(24, 24, 27, 0.8)",
        border: "1px solid rgba(39, 39, 42, 0.8)",
        borderRadius: "24px",
        padding: "24px",
        height: "120px",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-0"
        style={shimmer}
        animate={{
          backgroundPosition: ["0% 0%", "200% 0%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center gap-3 h-full">
        <div
          className="w-14 h-14 rounded-full"
          style={{ background: "rgba(255, 255, 255, 0.1)" }}
        />
        <div
          className="h-4 w-20 rounded"
          style={{ background: "rgba(255, 255, 255, 0.12)" }}
        />
      </div>
    </motion.div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case "balance":
        return <BalanceSkeleton />;
      case "transaction":
        return <TransactionSkeleton />;
      case "card":
      default:
        return <CardSkeleton />;
    }
  };

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}

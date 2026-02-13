"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { TOTAL_BALANCE } from "@/lib/mock-data";
import BottomNav from "@/components/bottom-nav";
import {
  ScanLine,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Shield,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

/* ─── Animation Variants ─── */
const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, damping: 28, stiffness: 100 },
  },
};

/* ─── Animated Counter ─── */
function AnimatedCounter({
  value,
  prefix = "$",
}: {
  value: number;
  prefix?: string;
}) {
  const [display, setDisplay] = useState("0.00");
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay((ease * value).toFixed(2));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return (
    <span className="tabular-nums font-numeric">
      {prefix}
      {display}
    </span>
  );
}

export default function WalletPage() {
  const router = useRouter();
  const { isLoggedIn, balances, transactions } = useApp();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="flex flex-col min-h-dvh px-5 pt-safe pb-28">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-5 pt-10"
      >
        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-overline text-muted-foreground/60 mb-0.5">
              Portfolio
            </p>
            <h1 className="text-h2">Welcome back 👋</h1>
          </div>
          <motion.div
            className="w-10 h-10 rounded-2xl glass flex items-center justify-center"
            whileHover={{ scale: 1.08, rotate: 3 }}
            whileTap={{ scale: 0.92 }}
            role="button"
            aria-label="User profile"
            tabIndex={0}
          >
            <span className="text-sm" role="img" aria-label="Developer avatar">
              🧑‍💻
            </span>
          </motion.div>
        </motion.div>

        {/* ── Balance Card ── */}
        <motion.div
          variants={fadeUp}
          className="glass-strong p-6 relative overflow-hidden shimmer"
        >
          {/* Decorative orb */}
          <div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.6), transparent 70%)",
            }}
            aria-hidden="true"
          />

          <p className="text-overline text-muted-foreground/70 mb-2">
            Total Balance
          </p>
          <h2 className="text-display tracking-tighter mb-2">
            <AnimatedCounter value={TOTAL_BALANCE} />
          </h2>

          {/* Gas Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/[0.08] border border-success/15"
            animate={{
              boxShadow: [
                "0 0 8px rgba(34,197,94,0.08)",
                "0 0 20px rgba(34,197,94,0.15)",
                "0 0 8px rgba(34,197,94,0.08)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-success status-dot" />
            <span className="text-[11px] font-semibold text-success tracking-wide">
              Gasless Mode Active
            </span>
          </motion.div>

          {/* Quick Actions */}
          <div className="flex gap-2.5 mt-6">
            {[
              { icon: ArrowUpRight, label: "Send", color: "text-primary" },
              { icon: ArrowDownLeft, label: "Receive", color: "text-accent" },
            ].map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="flex-1 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center gap-2 text-[13px] font-medium hover:bg-white/[0.05] transition-colors focus-ring"
                aria-label={action.label}
              >
                <action.icon className={`w-4 h-4 ${action.color}`} />
                {action.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Scan to Pay CTA ── */}
        <motion.button
          variants={fadeUp}
          onClick={() => router.push("/scan")}
          className="w-full py-[18px] rounded-2xl text-white font-semibold text-[15px] flex items-center justify-center gap-3 pulse-glow btn-magnetic relative overflow-hidden focus-ring"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06d6a0)",
          }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
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
          <ScanLine className="w-5 h-5" />
          Scan to Pay
          <Sparkles className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
        </motion.button>

        {/* ── Token List ── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-caption text-muted-foreground/80 flex items-center gap-1.5">
              <TrendingUp
                className="w-3 h-3 text-success"
                aria-hidden="true"
              />
              Assets
            </h3>
          </div>

          <div className="flex flex-col gap-2" role="list">
            {balances.map((token, i) => (
              <motion.div
                key={token.symbol}
                role="listitem"
                className="glass gradient-border flex items-center gap-4 p-4 group cursor-default"
                initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{
                  delay: 0.35 + i * 0.08,
                  type: "spring",
                  damping: 25,
                }}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
              >
                {/* Token Icon */}
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${token.color}25, ${token.color}08)`,
                  }}
                >
                  <span role="img" aria-label={token.name}>
                    {token.icon}
                  </span>
                </div>

                {/* Token Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold">{token.symbol}</p>
                  <p className="text-[11px] text-muted-foreground/60">
                    {token.name}
                  </p>
                </div>

                {/* Balance */}
                <div className="text-right">
                  <p className="text-[13px] font-semibold tabular-nums font-numeric">
                    ${token.usdValue.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 tabular-nums font-numeric">
                    {token.balance.toFixed(2)}
                  </p>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Recent Transactions ── */}
        <motion.div variants={fadeUp} id="activity">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-caption text-muted-foreground/80 flex items-center gap-1.5">
              <Shield
                className="w-3 h-3 text-primary/60"
                aria-hidden="true"
              />
              Recent Activity
            </h3>
          </div>

          <div className="flex flex-col gap-1.5" role="list">
            {transactions.slice(0, 3).map((tx, i) => (
              <motion.div
                key={tx.id}
                role="listitem"
                className="glass flex items-center gap-3 p-3.5 group"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.6 + i * 0.06,
                  type: "spring",
                  damping: 25,
                }}
                whileHover={{ x: 2, transition: { duration: 0.15 } }}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/[0.12] to-primary/[0.04] flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-primary/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate">
                    {tx.merchant}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50">
                    {tx.timestamp}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-semibold text-danger/90 tabular-nums font-numeric">
                    -${tx.amount.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/40">
                    {tx.token}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <BottomNav />
    </div>
  );
}

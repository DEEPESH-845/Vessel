"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useEffect } from "react";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, damping: 20, stiffness: 120 },
  },
};

const features = [
  {
    icon: Zap,
    label: "Zero Gas",
    desc: "Paymaster sponsors every transaction",
    gradient: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
  },
  {
    icon: Shield,
    label: "AI-Secured",
    desc: "Bedrock-powered fraud detection",
    gradient: "from-primary/20 to-violet-500/10",
    iconColor: "text-primary",
  },
  {
    icon: TrendingUp,
    label: "Any Stablecoin",
    desc: "USDC · USDT · DAI & more",
    gradient: "from-accent/20 to-emerald-500/10",
    iconColor: "text-accent",
  },
] as const;

export default function LandingPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useApp();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/wallet");
    }
  }, [isLoggedIn, router]);

  const handleLogin = () => {
    login();
    router.push("/wallet");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 pb-8 pt-safe">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center text-center w-full max-w-[380px]"
      >
        <motion.div variants={scaleIn} className="relative mb-10">
          <motion.div
            className="absolute -inset-4 rounded-[30px] opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />

          <motion.div
            className="relative w-[72px] h-[72px] rounded-[20px] flex items-center justify-center overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #6366f1, #8b5cf6, #06d6a0)",
            }}
            animate={{
              boxShadow: [
                "0 0 24px rgba(99,102,241,0.3), 0 12px 40px rgba(0,0,0,0.4)",
                "0 0 48px rgba(6,214,160,0.3), 0 12px 40px rgba(0,0,0,0.4)",
                "0 0 24px rgba(99,102,241,0.3), 0 12px 40px rgba(0,0,0,0.4)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-[28px] font-extrabold text-white tracking-tighter">
              V
            </span>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-display mb-3">
            <span className="text-gradient">Vessel</span>
          </h1>
          <p className="text-body text-muted-foreground font-light leading-relaxed max-w-[280px] mx-auto">
            The gasless payment layer for the stablecoin economy.{" "}
            <span className="text-foreground/60">
              Zero gas. One tap. Instant.
            </span>
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="w-full space-y-2.5 mb-10"
          role="list"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              role="listitem"
              className="glass gradient-border flex items-center gap-4 p-4 group cursor-default"
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.6 + i * 0.12,
                type: "spring",
                damping: 20,
                stiffness: 90,
              }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
            >
              <div
                className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center flex-shrink-0`}
              >
                <f.icon className={`w-5 h-5 ${f.iconColor}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-semibold leading-tight">
                  {f.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {f.desc}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/80 transition-colors" />
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          variants={fadeUp}
          onClick={handleLogin}
          className="w-full py-[18px] px-6 rounded-2xl text-white font-semibold text-[15px] flex items-center justify-center gap-3 btn-magnetic relative overflow-hidden focus-ring"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06d6a0)",
          }}
          whileHover={{
            scale: 1.015,
            boxShadow:
              "0 0 40px rgba(99,102,241,0.35), 0 12px 40px rgba(0,0,0,0.3)",
          }}
          whileTap={{ scale: 0.98 }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            e.currentTarget.style.setProperty("--mouse-x", `${x}%`);
            e.currentTarget.style.setProperty("--mouse-y", `${y}%`);
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 48 48"
            fill="none"
            className="flex-shrink-0"
            aria-hidden="true"
          >
            <path
              d="M43.6 20.5H42V20.3H24v7.4h11.3C34 32.1 29.5 35.1 24 35.1c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.3-5.3C33.5 5.4 29 3.1 24 3.1 12.4 3.1 3 12.5 3 24.1s9.4 21 21 21c11.6 0 21-9.4 21-21 0-1.2-.1-2.4-.4-3.6z"
              fill="#FFC107"
            />
            <path
              d="M5.3 14.7l6.1 4.5c1.6-4.2 5.7-7.1 10.6-7.1 3 0 5.8 1.1 7.9 3l5.3-5.3C31.5 6.4 28 4.1 24 4.1c-7.2 0-13.4 4.1-16.7 10.6z"
              fill="#FF3D00"
            />
            <path
              d="M24 44.1c4.9 0 9.3-1.7 12.8-4.6l-5.9-5c-1.9 1.3-4.3 2.2-6.9 2.2-5.4 0-10-3.6-11.6-8.5l-6.1 4.7C9.5 39.5 16.2 44.1 24 44.1z"
              fill="#4CAF50"
            />
            <path
              d="M43.6 20.5H42V20.3H24v7.4h11.3C34.8 29.7 34 31.5 32.9 33l5.9 5c-.4.4 5.2-3.8 5.2-14 0-1.2-.1-2.4-.4-3.5z"
              fill="#1976D2"
            />
          </svg>
          Continue with Google
          <ArrowRight className="w-4 h-4 opacity-70" />
        </motion.button>

        <motion.div
          variants={fadeUp}
          className="flex items-center gap-2 mt-6"
        >
          <Sparkles className="w-3 h-3 text-primary/40" aria-hidden="true" />
          <p className="text-[10px] text-muted-foreground/40 tracking-wide">
            ERC-4337 on Lisk · Non-custodial · Open Source
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

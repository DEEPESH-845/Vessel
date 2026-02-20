"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import Spotlight from "@/components/aceternity/spotlight";
import TextGenerateEffect from "@/components/aceternity/text-generate-effect";
import BackgroundBeams from "@/components/aceternity/background-beams";
import MovingBorder from "@/components/aceternity/moving-border";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";

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
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    label: "Zero Gas",
    desc: "Paymaster sponsors every transaction",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
  {
    icon: <Shield className="w-5 h-5 text-primary" />,
    label: "AI-Secured",
    desc: "Bedrock-powered fraud detection",
    gradient: "from-primary/20 to-violet-500/10",
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-accent" />,
    label: "Any Stablecoin",
    desc: "USDC · USDT · DAI & more",
    gradient: "from-accent/20 to-emerald-500/10",
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
    <div className="relative flex flex-col items-center justify-center min-h-dvh px-6 pb-8 pt-safe overflow-hidden">
      {/* Aceternity UI Effects */}
      <Spotlight />
      <BackgroundBeams />

      {/* Gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08), transparent 50%), radial-gradient(circle at 80% 20%, rgba(204, 255, 0, 0.04), transparent 40%)",
        }}
        aria-hidden="true"
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center w-full max-w-[380px]"
      >
        {/* Logo */}
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

        {/* Hero Text with Text Generate Effect */}
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-display mb-3">
            <span className="text-gradient">Vessel</span>
          </h1>
          <TextGenerateEffect
            words="The gasless payment layer for the stablecoin economy. Zero gas. One tap. Instant."
            className="text-body text-muted-foreground font-light leading-relaxed max-w-[280px] mx-auto"
            delay={0.5}
          />
        </motion.div>

        {/* Features with Bento Grid */}
        <motion.div variants={fadeUp} className="w-full mb-10">
          <BentoGrid>
            {features.map((feature, idx) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.8 + idx * 0.12,
                  type: "spring",
                  damping: 20,
                  stiffness: 90,
                }}
              >
                <BentoGridItem
                  title={feature.label}
                  description={feature.desc}
                  icon={feature.icon}
                  gradient={feature.gradient}
                />
              </motion.div>
            ))}
          </BentoGrid>
        </motion.div>

        {/* CTA Button with Moving Border */}
        <motion.div variants={fadeUp} className="w-full">
          <MovingBorder
            onClick={handleLogin}
            duration={3000}
            containerClassName="w-full"
            className="w-full py-[18px] px-6 flex items-center justify-center gap-3 cursor-pointer"
          >
            <motion.div
              className="flex items-center justify-center gap-3 w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
              <span
                className="font-semibold text-[15px]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: "#FFFFFF",
                }}
              >
                Continue with Google
              </span>
              <ArrowRight className="w-4 h-4 opacity-70" />
            </motion.div>
          </MovingBorder>
        </motion.div>

        {/* Footer */}
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

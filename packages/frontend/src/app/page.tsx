"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Zap, Shield, TrendingUp, ArrowRight } from "lucide-react";

// NYC Rebel-inspired design - dark theme with card-based UI
// Color palette: #0A0A0A (background), #18181B (cards), #27272A (borders), #FFFFFF (text)
// Typography: Space Grotesk (headings), Inter (body)

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 100 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.15,
      type: "spring",
      damping: 20,
      stiffness: 80,
    },
  }),
};

const features = [
  {
    icon: Zap,
    iconBg: "rgba(99, 102, 241, 0.12)",
    iconColor: "#6366F1",
    title: "Zero Gas Fees",
    desc: "Paymaster sponsors every transaction. Never pay gas again.",
  },
  {
    icon: Shield,
    iconBg: "rgba(6, 214, 160, 0.08)",
    iconColor: "#06D6A0",
    title: "AI Security",
    desc: "Bedrock-powered fraud detection keeps your funds safe.",
  },
  {
    icon: TrendingUp,
    iconBg: "rgba(245, 158, 11, 0.12)",
    iconColor: "#F59E0B",
    title: "Any Stablecoin",
    desc: "USDC · USDT · DAI and more supported out of the box.",
  },
];

const stats = [
  { value: "$2.5B+", label: "Volume Processed" },
  { value: "500K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
];

export default function LandingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const hasLoggedIn = document.cookie.includes('has_logged_in=true');
        
        if (hasLoggedIn) {
          const response = await fetch('/api/auth/me');
          const data = await response.json();
          
          if (data.user) {
            router.push('/wallet');
            return;
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  const handleLogin = () => {
    window.location.href = '/api/auth/login?connection=google-oauth2';
  };

  if (isCheckingAuth) {
    return (
      <div 
        className="flex items-center justify-center min-h-dvh"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CCFF00"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </motion.div>
          <p style={{ color: '#71717A', fontFamily: "'Inter', sans-serif" }}>
            Checking authentication...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="relative flex flex-col w-full overflow-x-hidden"
      style={{ backgroundColor: '#0A0A0A', minHeight: '100vh' }}
    >
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center w-full px-6 py-24 md:py-32">
        {/* Gradient Background */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
          }}
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 flex flex-col items-center text-center w-full max-w-3xl"
        >
          {/* Logo */}
          <motion.div variants={fadeUp} className="mb-8">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #6366F1, #8B5CF6, #06D6A0)',
                }}
              >
                <span className="text-3xl font-bold text-white tracking-tight">V</span>
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={fadeUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{ 
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#FFFFFF',
            }}
          >
            The gasless payment layer for{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06D6A0 100%)',
                WebkitBackgroundClip: 'text',
              }}
            >
              stablecoins
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={fadeUp}
            className="text-lg md:text-xl mb-10 max-w-xl"
            style={{ 
              fontFamily: "'Inter', sans-serif",
              color: '#A1A1AA',
            }}
          >
            Zero gas. One tap. Instant. Experience the future of crypto payments with AI-powered security.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
          >
            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: '#FFFFFF',
                color: '#0A0A0A',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium text-lg transition-all hover:bg-[#27272A] border border-[#27272A]"
              style={{ 
                backgroundColor: '#18181B',
                color: '#FFFFFF',
                borderColor: '#27272A',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Learn More
            </button>
          </motion.div>

          {/* Trust Row */}
          <motion.p 
            variants={fadeUp}
            className="mt-8 text-sm"
            style={{ 
              fontFamily: "'Inter', sans-serif",
              color: '#71717A',
            }}
          >
            ERC-4337 · Non-custodial · Open Source
          </motion.p>
        </motion.div>
      </section>

      {/* Features Section - NYC Rebel Card Style */}
      <section 
        className="flex flex-col items-center w-full px-6 py-20"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col items-center w-full max-w-5xl"
        >
          <motion.h2 
            variants={fadeUp}
            className="text-3xl md:text-4xl font-bold mb-4 text-center"
            style={{ 
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#FFFFFF',
            }}
          >
            Why Vessel?
          </motion.h2>
          
          <motion.p 
            variants={fadeUp}
            className="text-lg mb-12 text-center"
            style={{ 
              fontFamily: "'Inter', sans-serif",
              color: '#71717A',
            }}
          >
            The most advanced stablecoin payment infrastructure
          </motion.p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  custom={idx}
                  variants={cardVariants}
                  className="flex flex-col gap-3 p-6 rounded-2xl"
                  style={{ 
                    backgroundColor: '#18181B',
                    border: '1px solid #27272A',
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ 
                      backgroundColor: feature.iconBg,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.iconColor }} />
                  </div>
                  <h3 
                    className="text-xl font-semibold"
                    style={{ 
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: '#FFFFFF',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ 
                      fontFamily: "'Inter', sans-serif",
                      color: '#A1A1AA',
                    }}
                  >
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section 
        className="flex flex-col items-center w-full px-6 py-16"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <div className="flex flex-wrap justify-center gap-12 md:gap-24">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <span 
                className="text-4xl md:text-5xl font-bold"
                style={{ 
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: '#FFFFFF',
                }}
              >
                {stat.value}
              </span>
              <span 
                className="text-base mt-2"
                style={{ 
                  fontFamily: "'Inter', sans-serif",
                  color: '#71717A',
                }}
              >
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="flex flex-col items-center w-full px-6 py-20"
        style={{ backgroundColor: '#18181B' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center max-w-2xl"
        >
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ 
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#FFFFFF',
            }}
          >
            Ready to get started?
          </h2>
          <p 
            className="text-lg mb-8"
            style={{ 
              fontFamily: "'Inter', sans-serif",
              color: '#A1A1AA',
            }}
          >
            Join thousands of users experiencing the future of crypto payments.
          </p>
          <button
            onClick={handleLogin}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: '#FFFFFF',
              color: '#0A0A0A',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Start Now
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer 
        className="flex flex-col items-center w-full px-6 py-10"
        style={{ 
          backgroundColor: '#0A0A0A',
          borderTop: '1px solid #27272A',
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #6366F1, #8B5CF6, #06D6A0)',
              }}
            >
              <span className="text-sm font-bold text-white">V</span>
            </div>
            <span 
              className="text-lg font-semibold"
              style={{ 
                fontFamily: "'Space Grotesk', sans-serif",
                color: '#FFFFFF',
              }}
            >
              Vessel
            </span>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            <a 
              href="#" 
              className="text-sm hover:opacity-80 transition-opacity"
              style={{ 
                fontFamily: "'Inter', sans-serif",
                color: '#71717A',
              }}
            >
              Documentation
            </a>
            <a 
              href="#" 
              className="text-sm hover:opacity-80 transition-opacity"
              style={{ 
                fontFamily: "'Inter', sans-serif",
                color: '#71717A',
              }}
            >
              GitHub
            </a>
            <a 
              href="#" 
              className="text-sm hover:opacity-80 transition-opacity"
              style={{ 
                fontFamily: "'Inter', sans-serif",
                color: '#71717A',
              }}
            >
              Twitter
            </a>
          </div>
        </div>

        <p 
          className="mt-8 text-xs"
          style={{ 
            fontFamily: "'Inter', sans-serif",
            color: '#52525A',
          }}
        >
          © 2025 Vessel. Built on ERC-4337.
        </p>
      </footer>
    </div>
  );
}
</parameter>
<task_progress>
- [x] Explore codebase structure
- [x] Find Pencil MCP configuration in Kiro settings
- [x] Review current Vessel landing page design
- [x] Locate "pencil-demo.pen" with "Habit tracker - NYC Rebel" design
- [x] Add Pencil MCP server to Cline configuration
- [x] Create design inspired by NYC Rebel template
- [x] Implement design in React components
</task_progress>
</invoke>

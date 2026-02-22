"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  ArrowRight, 
  Wallet, 
  Activity,
  Globe,
  Layers,
  ChevronRight,
  Bitcoin,
  Send,
  ArrowDownLeft,
  Star
} from "lucide-react";

// Web3 Dashboard Design System
const COLORS = {
  background: "#0B0F19",
  backgroundAlt: "#0E1320",
  card: "rgba(14, 19, 32, 0.8)",
  primary: "#3B82F6",
  primaryPurple: "#8B5CF6",
  accent: "#06B6D4",
  success: "#10B981",
  warning: "#F59E0B",
  text: "#FFFFFF",
  textMuted: "#94A3B8",
};

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, damping: 20, stiffness: 100 }
  },
};

const features = [
  {
    icon: Zap,
    title: "Zero Gas Fees",
    desc: "Paymaster sponsors every transaction. Never pay gas again.",
  },
  {
    icon: Shield,
    title: "AI Security",
    desc: "Bedrock-powered fraud detection keeps your funds safe.",
  },
  {
    icon: TrendingUp,
    title: "Any Stablecoin",
    desc: "USDC · USDT · DAI and more supported out of the box.",
  },
];

const stats = [
  { value: "$2.5B+", label: "Volume Processed" },
  { value: "500K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
];

const assets = [
  { symbol: "ETH", name: "Ethereum", balance: "2.45", value: "$4,182.50", icon: Bitcoin },
  { symbol: "USDC", name: "USD Coin", balance: "1,250.00", value: "$1,250.00", icon: Wallet },
  { symbol: "USDT", name: "Tether", balance: "500.00", value: "$500.00", icon: Wallet },
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
      <div className="flex items-center justify-center min-h-dvh" style={{ backgroundColor: COLORS.background }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: COLORS.background }}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.15), transparent),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(139, 92, 246, 0.1), transparent),
            radial-gradient(ellipse 50% 30% at 20% 80%, rgba(6, 182, 212, 0.08), transparent)`,
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 md:px-12">
        <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #06B6D4 100%)' }}>
              <span className="text-xl font-bold text-white">V</span>
            </div>
            <span className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.text }}>Vessel</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Security', 'Pricing', 'Docs'].map((item) => (
              <a key={item} href="#" className="text-sm font-medium transition-colors hover:text-white" style={{ color: COLORS.textMuted }}>{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleLogin} className="px-5 py-2.5 text-sm font-semibold rounded-lg transition-all hover:bg-white/10" style={{ color: COLORS.text }}>Sign In</button>
            <button onClick={handleLogin} className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white transition-all" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}>Get Started</button>
          </div>
        </motion.nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 py-16 md:py-24 md:px-12">
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-5xl mx-auto text-center">
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60A5FA' }}>
              <Star className="w-3 h-3" />Now live on Lisk Mainnet
            </span>
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.text }}>
            The gasless payment layer <span className="bg-clip-text text-transparent" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #06B6D0 100%)', WebkitBackgroundClip: 'text' }}>for stablecoins</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.textMuted }}>
            Zero gas. One tap. Instant. Experience the future of crypto payments with AI-powered security built on ERC-4337.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button onClick={handleLogin} className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', boxShadow: '0 4px 24px rgba(59, 130, 246, 0.3)' }}>
              Start Now<ArrowRight className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium transition-all hover:bg-white/5" style={{ border: '1px solid rgba(255, 255, 255, 0.1)', color: COLORS.text }}>
              <Globe className="w-5 h-5" />View Documentation
            </button>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: COLORS.textMuted }}>
            <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" />Non-custodial</span>
            <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" />ERC-4337</span>
            <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-purple-400" />Open Source</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-16 md:px-12" style={{ backgroundColor: COLORS.backgroundAlt }}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.text }}>Why choose Vessel?</motion.h2>
            <motion.p variants={fadeInUp} className="text-lg" style={{ color: COLORS.textMuted }}>The most advanced stablecoin payment infrastructure</motion.p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={fadeInUp} className="p-6 rounded-2xl cursor-pointer" style={{ background: COLORS.card, border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)' }}>
                  <div className="flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <Icon className="w-6 h-6" style={{ color: '#60A5FA' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.text }}>{feature.title}</h3>
                      <p className="text-sm" style={{ color: COLORS.textMuted }}>{feature.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-6 py-16 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((stat, idx) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                <div className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: COLORS.textMuted }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wallet Preview */}
      <section className="relative z-10 px-6 py-16 md:px-12" style={{ backgroundColor: COLORS.backgroundAlt }}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.text }}>Your assets, beautifully organized</h2>
              <p className="text-lg" style={{ color: COLORS.textMuted }}>Track your portfolio across all chains in real-time</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="rounded-2xl p-6 max-w-md mx-auto" style={{ background: 'rgba(14, 19, 32, 0.9)', border: '1px solid rgba(59, 130, 246, 0.2)', boxShadow: '0 0 60px rgba(59, 130, 246, 0.1)' }}>
              <div className="rounded-xl p-5 mb-6" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm" style={{ color: COLORS.textMuted }}>Total Balance</span>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400"></div><span className="text-xs text-emerald-400">Live</span></div>
                </div>
                <div className="text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.text }}>$6,182.50</div>
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA' }}><Send className="w-4 h-4" />Send</button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34D399' }}><ArrowDownLeft className="w-4 h-4" />Receive</button>
                </div>
              </div>
              <div className="space-y-3">
                {assets.map((asset) => {
                  const Icon = asset.icon;
                  return (
                    <div key={asset.symbol} className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)' }}><Icon className="w-5 h-5 text-blue-400" /></div>
                        <div><div className="font-medium" style={{ color: COLORS.text }}>{asset.symbol}</div><div className="text-xs" style={{ color: COLORS.textMuted }}>{asset.name}</div></div>
                      </div>
                      <div className="text-right"><div className="font-medium" style={{ color: COLORS.text }}>{asset.balance}</div><div className="text-xs" style={{ color: COLORS.textMuted }}>{asset.value}</div></div>
                    </div>
                  );
                })}
              </div>
              <button className="w-full mt-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1" style={{ color: COLORS.textMuted }}>View All Assets<ChevronRight className="w-4 h-4" /></button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl p-10" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.text }}>Ready to get started?</h2>
            <p className="text-lg mb-8" style={{ color: COLORS.textMuted }}>Join thousands of users experiencing the future of crypto payments.</p>
            <button onClick={handleLogin} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', boxShadow: '0 4px 24px rgba(59, 130, 246, 0.4)' }}>Create Wallet<ArrowRight className="w-5 h-5" /></button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-10 md:px-12" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}><span className="text-sm font-bold text-white">V</span></div>
              <span className="font-semibold" style={{ color: COLORS.text }}>Vessel</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {['Documentation', 'GitHub', 'Twitter', 'Discord'].map((item) => (<a key={item} href="#" className="text-sm transition-colors hover:text-white" style={{ color: COLORS.textMuted }}>{item}</a>))}
            </div>
          </div>
          <div className="mt-8 pt-8 text-center text-sm" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', color: COLORS.textMuted }}>© 2025 Vessel. Built on ERC-4337.</div>
        </div>
      </footer>
    </div>
  );
}

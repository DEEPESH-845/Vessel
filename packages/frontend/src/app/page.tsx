'use client';

/**
 * Vessel Landing Page
 * Gasless stablecoin payments for global commerce
 * Cinematic Web3 experience with GSAP + Three.js
 */

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { CTASection } from '@/components/landing/CTASection';
import { registerGSAP } from '@/lib/gsap';

// Dynamically import smooth scroll provider to avoid SSR issues
const SmoothScrollProvider = dynamic(
  () => import('@/components/smooth-scroll-provider').then((mod) => mod.SmoothScrollProvider),
  { ssr: false }
);

export default function LandingPage() {
  useEffect(() => {
    registerGSAP();
  }, []);

  return (
    <SmoothScrollProvider>
      <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
        {/* Noise grain overlay - global */}
        <div className="noise-overlay" />
        
        {/* Navigation */}
        <Navbar />

        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* CTA Section */}
        <CTASection />

        {/* Footer - Unified Design System */}
        <footer className="relative section-vertical section-bg-dark border-t border-white/[0.05]">
          <div className="container-section">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-white">Vessel</span>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  Gasless stablecoin payments for global commerce. One tap. Zero gas. Instant.
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-3">
                  <li><a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="text-sm text-white/50 hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="#benefits" className="text-sm text-white/50 hover:text-white transition-colors">Benefits</a></li>
                  <li><a href="/wallet" className="text-sm text-white/50 hover:text-white transition-colors">Wallet</a></li>
                </ul>
              </div>

              {/* Technology */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Technology</h4>
                <ul className="space-y-3">
                  <li><span className="text-sm text-white/50">ERC-4337</span></li>
                  <li><span className="text-sm text-white/50">Account Abstraction</span></li>
                  <li><span className="text-sm text-white/50">StableSwap AMM</span></li>
                  <li><span className="text-sm text-white/50">Gelato Relay</span></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-3">
                  <li><a href="https://github.com/DEEPESH-845/Vessel" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors">GitHub</a></li>
                  <li><a href="https://twitter.com/VesselPayments" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors">Twitter</a></li>
                  <li><span className="text-sm text-white/50">Discord</span></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-white/40">
                © 2025 Vessel. Gasless payments for the stablecoin economy.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">Privacy Policy</a>
                <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </SmoothScrollProvider>
  );
}
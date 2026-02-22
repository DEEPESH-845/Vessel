'use client';

/**
 * HeroSection Component
 * Cinematic full-viewport hero with orchestrated GSAP timeline
 * Awwwards-level entrance animations - UNIFIED DESIGN SYSTEM
 */

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';

// Dynamically import CinematicPlanet to avoid SSR issues
const CinematicPlanet = dynamic(
  () => import('./CinematicPlanet').then((mod) => mod.CinematicPlanet),
  { ssr: false }
);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dynamic import for GSAP plugins
    const initGSAP = async () => {
      const ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if (!sectionRef.current || !contentRef.current) return;

      // Set initial states
      const initialStates = {
        content: { opacity: 0 },
        badge: { opacity: 0, y: 30 },
        heading: { opacity: 0, y: 50 },
        subheading: { opacity: 0, y: 30 },
        cta: { opacity: 0, y: 30, scale: 0.95 },
        stats: { opacity: 0, y: 20 },
        scrollIndicator: { opacity: 0 },
      };

      if (!prefersReducedMotion) {
        gsap.set(contentRef.current, initialStates.content);
        if (badgeRef.current) gsap.set(badgeRef.current, initialStates.badge);
        if (headingRef.current) gsap.set(headingRef.current, initialStates.heading);
        if (subheadingRef.current) gsap.set(subheadingRef.current, initialStates.subheading);
        if (ctaRef.current) gsap.set(ctaRef.current, initialStates.cta);
        if (statsRef.current) gsap.set(statsRef.current, initialStates.stats);
        if (scrollIndicatorRef.current) gsap.set(scrollIndicatorRef.current, initialStates.scrollIndicator);
      }

      // Master timeline
      const masterTimeline = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
      });

      if (prefersReducedMotion) {
        // Just show everything immediately
        masterTimeline.to([contentRef.current, badgeRef.current, headingRef.current, subheadingRef.current, ctaRef.current, statsRef.current, scrollIndicatorRef.current], {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.01,
        });
      } else {
        // Cinematic entrance sequence
        masterTimeline

          // Phase 1: Background content fade in
          .to(contentRef.current, {
            opacity: 1,
            duration: 0.4,
          })

          // Phase 2: Badge appears
          .to(badgeRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
          }, '-=0.2')

          // Phase 3: Main headline with slight blur effect
          .to(headingRef.current, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
          }, '-=0.5')

          // Phase 4: Subheading
          .to(subheadingRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.7,
          }, '-=0.6')

          // Phase 5: CTA buttons with scale
          .to(ctaRef.current, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.4)',
          }, '-=0.4')

          // Phase 6: Stats
          .to(statsRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.6,
          }, '-=0.3')

          // Phase 7: Scroll indicator
          .to(scrollIndicatorRef.current, {
            opacity: 1,
            duration: 0.5,
          }, '-=0.2');
      }

      // Scroll-based zoom and fade - smoother transition to next section
      gsap.to(contentRef.current, {
        scale: 1.15,
        opacity: 0,
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '70% top',
          scrub: 1.5,
          pin: false,
        },
      });
    };

    initGSAP();

    return () => {
      if (typeof window !== 'undefined') {
        import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        });
      }
    };
  }, [mounted]);

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden section-bg-primary"
    >
      {/* 3D Cinematic Planet System */}
      <CinematicPlanet />

      {/* Noise grain overlay */}
      <div className="noise-overlay" />

      {/* Text Content - ALIGNED: Same container width as navbar */}
      <div
        ref={contentRef}
        className="hero-content relative flex flex-col items-center justify-center min-h-screen text-center"
        style={{
          maxWidth: '1280px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: 'var(--space-3)',
          paddingRight: 'var(--space-3)',
        }}
      >
        {/* Badge */}
        <div ref={badgeRef} className="mb-[var(--space-4)]">
          <span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-white/80"
            style={{
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Powered by Lisk • ERC-4337
          </span>
        </div>

        {/* Main Heading - Unified Typography */}
        <h1
          ref={headingRef}
          className="text-hero font-extrabold text-white mb-[var(--space-5)] max-w-[900px] text-center"
        >
          Gasless Payments for the{' '}
          <span className="text-gradient-animate inline-block">
            Stablecoin Economy
          </span>
        </h1>

        {/* Subtext - Unified styling */}
        <p
          ref={subheadingRef}
          className="text-white/55 max-w-xl leading-relaxed mb-[var(--space-8)] text-lg md:text-xl"
        >
          Zero gas. One tap. Instant. Accept any stablecoin, settle in your preferred currency. 
          Built for global commerce with Account Abstraction.
        </p>

        {/* CTA Buttons - Unified styling */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/wallet"
            className="btn-primary-unified group"
          >
            Launch Wallet
            <svg 
              className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <Link
            href="#features"
            className="btn-secondary-unified"
          >
            Learn More
          </Link>
        </div>

        {/* Stats - Unified spacing */}
        <div ref={statsRef} className="mt-[var(--space-16)] flex items-center gap-8 md:gap-12">
          {[
            { value: '<15s', label: 'Settlement' },
            { value: '0%', label: 'Gas Fees' },
            { value: '98%+', label: 'Success Rate' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div 
                className="text-xl md:text-2xl font-bold text-white" 
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div 
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/25 flex items-start justify-center p-2 scroll-indicator">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>

      {/* STABILIZED: Extended bottom gradient fade for smoother transition */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #060b14 0%, rgba(6,11,20,0.9) 30%, rgba(6,11,20,0.5) 60%, transparent 100%)',
        }}
      />
    </section>
  );
}

export default HeroSection;
# Landing Page Scaffolding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the ground-up scaffolding of the new "Maximalist Cyberpunk" landing page. This will replace the old `page.tsx` with a sequence of high-impact, kinetic React components drawn from premium UI libraries.

**Architecture:** We will build an ultra-minimal floating header, update the CyberHero to be driven by ScrollTrigger, and construct empty container wrappers for the Globe, Timeline, and Features sections.

**Tech Stack:** React (Next.js 16), Tailwind CSS 4, Framer Motion, GSAP (ScrollTrigger).

---

### Task 1: Create the CyberNav Component

**Files:**
- Create: `packages/frontend/src/components/landing/new/CyberNav.tsx`

**Step 1: Write the minimal CyberNav component**

Create a sticky, floating navigation bar that responds to scroll.

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export function CyberNav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 inset-x-0 z-50 p-4 font-mono pointer-events-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 border border-white/20 bg-black flex items-center justify-center group-hover:border-[#00ff41] transition-colors">
            <div className="w-2 h-2 bg-[#00ff41] animate-pulse" />
          </div>
          <span className="font-bold text-white tracking-widest uppercase">VESSEL</span>
        </Link>

        {/* CTA */}
        <Link
          href="/wallet"
          className="border border-white/20 bg-black/50 backdrop-blur-md px-6 py-2 text-xs font-bold tracking-widest text-white hover:text-[#00ff41] hover:border-[#00ff41] transition-all uppercase"
        >
          [ LAUNCH_APP ]
        </Link>
      </div>
    </motion.nav>
  );
}
```

**Step 2: Commit**

```bash
git add packages/frontend/src/components/landing/new/CyberNav.tsx
git commit -m "feat(landing): build responsive minimalist CyberNav"
```

---

### Task 2: Implement GSAP ScrollTrigger in CyberHero

**Files:**
- Modify: `packages/frontend/src/components/landing/new/CyberHero.tsx`

**Step 1: Add ScrollTrigger logic to pin and scale the text**

We want the text to explode outward as the user scrolls down.

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function CyberHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic import for ScrollTrigger to avoid SSR issues
    const initGSAP = async () => {
      const ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current || !textGroupRef.current) return;

      // Initial entrance animation
      const tl = gsap.timeline();
      tl.fromTo('.hero-text-line',
        { y: 150, opacity: 0, rotate: 5 },
        { y: 0, opacity: 1, rotate: 0, duration: 1.2, stagger: 0.1, ease: 'power4.out', delay: 0.2 }
      );

      // Scroll-driven explosion/reveal
      gsap.to(textGroupRef.current, {
        scale: 4,
        opacity: 0,
        filter: "blur(20px)",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          pin: true,
        }
      });
    };

    initGSAP();

    return () => {
      if (typeof window !== 'undefined') {
        import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
          ScrollTrigger.getAll().forEach(t => t.kill());
        });
      }
    };
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden font-mono bg-black">
      <div className="absolute inset-0 scanlines opacity-30 z-10 pointer-events-none" />

      {/* Background grid */}
      <div className="absolute inset-0 z-0"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '4vw 4vw' }}
      />

      <div ref={textGroupRef} className="relative z-20 text-center flex flex-col gap-2 pointer-events-none">
        <div className="overflow-hidden">
          <h1 className="hero-text-line text-[10vw] font-black leading-none uppercase tracking-tighter text-white">
            VESSEL <span className="text-[#00ff41]">PROTOCOL</span>
          </h1>
        </div>
        <div className="overflow-hidden">
          <h1 className="hero-text-line text-[10vw] font-black leading-none uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: '2px white' }}>
            ZERO_GAS
          </h1>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add packages/frontend/src/components/landing/new/CyberHero.tsx
git commit -m "feat(landing): wire up CyberHero with GSAP ScrollTrigger pinning and scaling"
```

---

### Task 3: Scaffold Aceternity Container Placeholders

**Files:**
- Create: `packages/frontend/src/components/landing/new/CyberGlobe.tsx`
- Create: `packages/frontend/src/components/landing/new/CyberTimeline.tsx`
- Create: `packages/frontend/src/components/landing/new/CyberFeatures.tsx`

**Step 1: Create CyberGlobe.tsx placeholder**

```tsx
export function CyberGlobe() {
  return (
    <section className="relative min-h-[80vh] w-full flex items-center justify-center font-mono border-b border-white/10">
      <div className="text-center z-10">
        <p className="text-[#00ff41] text-xs uppercase tracking-widest mb-4">[ ACETERNITY_GLOBE_PENDING ]</p>
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">Global Network</h2>
      </div>
      {/* The 3D Canvas will eventually go here */}
    </section>
  );
}
```

**Step 2: Create CyberTimeline.tsx placeholder**

```tsx
export function CyberTimeline() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center font-mono py-32 border-b border-white/10">
      <div className="text-center mb-16 z-10">
        <p className="text-[#00f0ff] text-xs uppercase tracking-widest mb-4">[ ACETERNITY_TIMELINE_PENDING ]</p>
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">Execution Flow</h2>
      </div>
      <div className="w-full max-w-4xl border border-white/20 h-96 cyber-border flex items-center justify-center bg-white/[0.02]">
        <span className="text-white/40 text-sm tracking-widest">TIMELINE_SCROLL_AREA</span>
      </div>
    </section>
  );
}
```

**Step 3: Create CyberFeatures.tsx placeholder**

```tsx
export function CyberFeatures() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center font-mono py-32 border-b border-white/10">
      <div className="text-center mb-16 z-10">
        <p className="text-[#ff00ff] text-xs uppercase tracking-widest mb-4">[ ACETERNITY_GLARE_CARDS_PENDING ]</p>
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">Core Directives</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-[3/4] border border-white/20 cyber-border flex items-center justify-center bg-white/[0.02]">
            <span className="text-white/40 text-sm tracking-widest">GLARE_CARD_{i}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

**Step 4: Commit**

```bash
git add packages/frontend/src/components/landing/new/
git commit -m "feat(landing): scaffold empty containers for upcoming Aceternity UI components"
```

---

### Task 4: Assemble and Wire Up the New Landing Page

**Files:**
- Modify: `packages/frontend/src/app/page.tsx`

**Step 1: Import and compose the sections**

Wrap everything in a main container that will eventually house the Tracing Beams component.

```tsx
import { CyberNav } from '@/components/landing/new/CyberNav';
import { CyberHero } from '@/components/landing/new/CyberHero';
import { CyberGlobe } from '@/components/landing/new/CyberGlobe';
import { CyberTimeline } from '@/components/landing/new/CyberTimeline';
import { CyberFeatures } from '@/components/landing/new/CyberFeatures';

export default function Home() {
  return (
    <main className="bg-black min-h-screen text-white selection:bg-[#00ff41] selection:text-black">
      <CyberNav />

      {/* We will eventually wrap these in an Aceternity TracingBeam component */}
      <div className="relative w-full">
        <CyberHero />
        <CyberGlobe />
        <CyberTimeline />
        <CyberFeatures />

        {/* Minimal Footer */}
        <footer className="py-12 border-t border-white/10 text-center font-mono text-xs text-white/40 uppercase tracking-widest">
          SYSTEM_END // VESSEL_PROTOCOL © 2026
        </footer>
      </div>
    </main>
  );
}
```

**Step 2: Commit**

```bash
git add packages/frontend/src/app/page.tsx
git commit -m "feat(landing): assemble new maximalist landing page layout"
```

---

### Task 5: Run Build and Tests

**Files:**
- Check: Terminal Output

**Step 1: Run standard checks**

Run `npm run build` and `npm run test` inside `packages/frontend` to ensure the new structural layout compiles correctly.

**Step 2: Commit**

```bash
git commit --allow-empty -m "chore: verify new landing page scaffold compilation"
```
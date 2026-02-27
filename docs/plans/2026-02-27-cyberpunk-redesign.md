# Vessel Cyberpunk Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Overhaul the Vessel frontend to a highly interactive, maximalist "Cyberpunk/Grid & Neon" aesthetic, sequentially starting with the Wallet Dashboard and finishing with a ground-up redesign of the Landing Page.

**Architecture:** We are preserving the existing Zustand store, React hooks, and API integrations. The rewrite is strictly isolated to the presentation layer. We will replace current "Premium Fintech" UI classes with sharp-cornered, high-contrast, exposed-grid CSS structures. We will introduce Lenis for smooth scrolling on the new landing page and inject heavy GSAP/ScrollTrigger usage.

**Tech Stack:** React (Next.js 16), Tailwind CSS 4, Framer Motion, GSAP (ScrollTrigger), Lenis, custom SVGs.

---

### Task 1: Establish Cyberpunk Theme Primitives

**Files:**
- Modify: `packages/frontend/src/app/globals.css`

**Step 1: Write the new CSS variables and utility classes**

Replace the soft "Premium Fintech" color variables and rounded corner scales with the hard Cyberpunk aesthetic.

```css
  /* ═══════════════════════════════════════════════════════════════════════════
     CYBERPUNK THEME OVERRIDES
     ═══════════════════════════════════════════════════════════════════════════ */
  --color-bg-void: #000000;
  --color-bg-surface: #0a0a0a;
  --color-bg-elevated: #111111;
  --color-bg-modal: rgba(0, 0, 0, 0.95);

  --color-primary: #00ff41; /* Neon Green */
  --color-primary-hover: #00cc33;
  --color-primary-glow: rgba(0, 255, 65, 0.5);
  --color-accent-cyan: #00f0ff;
  --color-accent-magenta: #ff00ff;
  --color-accent-yellow: #fcee0a;

  --color-border-subtle: rgba(255, 255, 255, 0.15);
  --color-border-active: var(--color-primary);

  --font-mono: "Space Mono", "JetBrains Mono", "Fira Code", monospace;

  /* Destroy border radiuses */
  --radius-sm: 0px;
  --radius-md: 0px;
  --radius-lg: 0px;
  --radius-xl: 0px;
  --radius-2xl: 0px;
  --radius-3xl: 0px;

  /* Raw, hard shadows */
  --shadow-glow-sm: 0 0 10px var(--color-primary-glow);
  --shadow-glow-md: 0 0 20px var(--color-primary-glow);
```

**Step 2: Add Glitch & Scanline Utility Classes**

```css
.cyber-border {
  border: 1px solid var(--color-border-subtle);
  position: relative;
}

.cyber-border::before {
  content: '';
  position: absolute;
  top: -1px; left: -1px;
  width: 10px; height: 10px;
  border-top: 1px solid var(--color-primary);
  border-left: 1px solid var(--color-primary);
}

.cyber-border::after {
  content: '';
  position: absolute;
  bottom: -1px; right: -1px;
  width: 10px; height: 10px;
  border-bottom: 1px solid var(--color-primary);
  border-right: 1px solid var(--color-primary);
}

.scanlines {
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0),
    rgba(255,255,255,0) 50%,
    rgba(0,0,0,0.2) 50%,
    rgba(0,0,0,0.2)
  );
  background-size: 100% 4px;
}
```

**Step 3: Run dev server to verify styling doesn't break compilation**

Run: `cd packages/frontend && npm run dev`
Expected: Server starts, no CSS compilation errors.

**Step 4: Commit**

```bash
git add packages/frontend/src/app/globals.css
git commit -m "style: establish core cyberpunk theme variables and utility classes"
```

---

### Task 2: Cyberpunk Wallet Layout & Navigation

**Files:**
- Modify: `packages/frontend/src/components/wallet/WalletDashboard.tsx`

**Step 1: Rewrite the Wallet Header**

Remove the rounded gradients. Implement the raw header.

```tsx
<header className="sticky top-0 z-50 bg-black border-b border-white/20">
  <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between font-mono">
    {/* Left - Brutalist Logo */}
    <div className="flex items-center gap-4">
      <Link href="/" className="flex items-center justify-center w-10 h-10 border border-white/20 text-white hover:text-[#00ff41] hover:border-[#00ff41] transition-colors">
        <ArrowLeftIcon />
      </Link>
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 border border-[#00ff41] bg-black flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#00ff41]" fill="currentColor">
            <path d="M12 2L8 8H4L12 22L20 8H16L12 2Z" />
          </svg>
        </div>
        <span className="font-bold text-white tracking-widest uppercase hidden sm:block">VESSEL_OS</span>
      </Link>
    </div>

    {/* Center - Status Terminal Style */}
    <div className="hidden md:flex items-center gap-3 px-4 py-1.5 border border-[#00ff41]/50 bg-[#00ff41]/5">
      <span className="w-2 h-2 bg-[#00ff41] animate-pulse" />
      <span className="text-xs text-[#00ff41] font-bold tracking-widest uppercase">
        {isAuthenticated ? 'UPLINK_SECURE' : 'GUEST_PROTO'}
      </span>
    </div>

    {/* Right - Actions */}
    <div className="flex items-center gap-2">
      <Link href="/activity" className="flex items-center justify-center w-10 h-10 border border-white/20 text-white/60 hover:text-[#00f0ff] hover:border-[#00f0ff] transition-colors">
        <HistoryIcon />
      </Link>
      <button className="flex items-center justify-center w-10 h-10 border border-white/20 text-white/60 hover:text-[#ff00ff] hover:border-[#ff00ff] transition-colors">
        <SettingsIcon />
      </button>
    </div>
  </div>
</header>
```

**Step 2: Commit**

```bash
git add packages/frontend/src/components/wallet/WalletDashboard.tsx
git commit -m "feat(wallet): rewrite header to brutalist cyberpunk aesthetic"
```

---

### Task 3: Cyberpunk Wallet Balance & Swap Panels

**Files:**
- Modify: `packages/frontend/src/components/wallet/WalletDashboard.tsx`

**Step 1: Rewrite the Balance Card**

Replace the smooth gradient balance card with a raw data readout.

```tsx
{/* Balance Terminal */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="p-6 border border-white/20 bg-black cyber-border font-mono relative overflow-hidden"
>
  <div className="absolute inset-0 scanlines pointer-events-none opacity-20" />
  <div className="relative z-10 flex justify-between items-start mb-4">
    <div>
      <p className="text-xs text-[#00f0ff] mb-2 uppercase tracking-widest">> TOTAL_ASSETS</p>
      <h2 className="text-4xl font-bold text-white tracking-tight">
        ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </h2>
      {ensName && (
        <p className="text-sm text-[#00ff41] mt-2">> {ensName}</p>
      )}
    </div>
    <div className="text-right">
      <p className="text-xs text-white/40 uppercase">ID: {displayAddress}</p>
      <div className="flex items-center gap-2 text-sm text-[#00ff41] mt-2 justify-end">
        <span className="font-bold">+ $0.00</span>
        <span className="text-white/30">|</span>
        <span className="text-xs uppercase">T_0</span>
      </div>
    </div>
  </div>
</motion.div>
```

**Step 2: Rewrite the Swap Panel**

```tsx
{/* Swap Terminal */}
<div className="p-6 bg-black border border-white/20 cyber-border font-mono">
  <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">> EXECUTE_SWAP</h3>

  {/* From */}
  <div className="p-4 border border-white/10 bg-white/[0.02] mb-3 hover:border-white/30 transition-colors">
    <div className="flex justify-between items-center mb-4">
      <span className="text-xs text-white/40 uppercase tracking-widest">INPUT_TOKEN</span>
      <select
        value={swapFrom.symbol}
        onChange={(e) => setSwapFrom(prev => ({ ...prev, symbol: e.target.value }))}
        className="bg-black text-sm text-[#00f0ff] border border-[#00f0ff]/30 px-2 py-1 outline-none cursor-pointer"
      >
        {TOKENS.map(token => (
          <option key={token.symbol} value={token.symbol}>
            {token.symbol}
          </option>
        ))}
      </select>
    </div>
    <input
      type="text"
      placeholder="0.00"
      value={swapFrom.amount}
      onChange={(e) => setSwapFrom({ ...swapFrom, amount: e.target.value })}
      className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/10"
    />
  </div>

  {/* Swap Direction Button */}
  <div className="flex justify-center -my-3 relative z-10">
    <button
      onClick={handleSwapDirection}
      className="w-12 h-12 bg-black border border-white/20 flex items-center justify-center text-white hover:text-[#ff00ff] hover:border-[#ff00ff] transition-colors shadow-[0_0_15px_rgba(0,0,0,1)]"
    >
      <SwapIcon />
    </button>
  </div>

  {/* To */}
  <div className="p-4 border border-white/10 bg-white/[0.02] mt-3 hover:border-white/30 transition-colors">
    <div className="flex justify-between items-center mb-4">
      <span className="text-xs text-white/40 uppercase tracking-widest">OUTPUT_TOKEN</span>
      <select
        value={swapTo.symbol}
        onChange={(e) => setSwapTo(prev => ({ ...prev, symbol: e.target.value }))}
        className="bg-black text-sm text-[#00ff41] border border-[#00ff41]/30 px-2 py-1 outline-none cursor-pointer"
      >
        {TOKENS.map(token => (
          <option key={token.symbol} value={token.symbol}>
            {token.symbol}
          </option>
        ))}
      </select>
    </div>
    <input
      type="text"
      placeholder="0.00"
      value={swapTo.amount}
      readOnly
      className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/10"
    />
  </div>

  {/* Swap Button */}
  <button
    onClick={handleSwap}
    disabled={!swapFrom.amount || isLoading || !isAuthenticated}
    className={`w-full mt-6 py-4 font-bold tracking-widest uppercase transition-all border ${
      isLoading || !swapFrom.amount || !isAuthenticated
        ? 'bg-white/5 text-white/20 border-white/10 cursor-not-allowed'
        : 'bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41] hover:bg-[#00ff41] hover:text-black hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]'
    }`}
  >
    {isLoading ? '> PROCESSING...' : isAuthenticated ? '> INITIALIZE_SWAP' : '> AUTH_REQUIRED'}
  </button>
</div>
```

**Step 3: Commit**

```bash
git add packages/frontend/src/components/wallet/WalletDashboard.tsx
git commit -m "feat(wallet): implement cyberpunk balance and swap panels"
```

---

### Task 4: Setup Lenis Smooth Scrolling

**Files:**
- Create: `packages/frontend/src/components/providers/LenisProvider.tsx`
- Modify: `packages/frontend/src/app/layout.tsx`

**Step 1: Install Lenis**

Run: `cd packages/frontend && npm install @studio-freight/react-lenis`

**Step 2: Create Lenis Provider**

```tsx
'use client';

import { ReactLenis } from '@studio-freight/react-lenis';
import { ReactNode } from 'react';

export function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.05, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
```

**Step 3: Wrap the layout**

In `layout.tsx`, wrap the body contents inside `<LenisProvider>`.

**Step 4: Commit**

```bash
git add packages/frontend/src/components/providers/LenisProvider.tsx packages/frontend/src/app/layout.tsx packages/frontend/package.json packages/frontend/package-lock.json
git commit -m "feat(frontend): setup Lenis smooth scrolling for landing page"
```

---

### Task 5: Scaffold New Landing Page (Maximalist Redesign)

**Files:**
- Modify: `packages/frontend/src/app/page.tsx`
- Delete: Old landing page components in `packages/frontend/src/components/landing/*`
- Create: `packages/frontend/src/components/landing/new/CyberHero.tsx`

*(Note: We will create a fresh directory for the new landing page components to keep it clean, then update `page.tsx` to only use the new components).*

**Step 1: Clear the old layout**

Modify `packages/frontend/src/app/page.tsx` to temporarily render a blank canvas with a massive typography placeholder.

```tsx
import { CyberHero } from '@/components/landing/new/CyberHero';

export default function Home() {
  return (
    <main className="bg-black min-h-screen text-white selection:bg-[#00ff41] selection:text-black">
      <CyberHero />
    </main>
  );
}
```

**Step 2: Build the CyberHero**

Build a giant, screen-filling typographic hero using GSAP to split and reveal text.

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function CyberHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP implementation for massive text scale-in
    if (!containerRef.current) return;

    gsap.fromTo('.hero-text-line',
      { y: 150, opacity: 0, rotate: 5 },
      { y: 0, opacity: 1, rotate: 0, duration: 1.2, stagger: 0.1, ease: 'power4.out', delay: 0.2 }
    );
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden font-mono">
      <div className="absolute inset-0 scanlines opacity-30 z-10 pointer-events-none" />

      {/* Background grid */}
      <div className="absolute inset-0 z-0"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '4vw 4vw' }}
      />

      <div className="relative z-20 text-center flex flex-col gap-2">
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

**Step 3: Commit**

```bash
git add packages/frontend/src/app/page.tsx packages/frontend/src/components/landing/new/CyberHero.tsx
git commit -m "feat(landing): scaffold new maximalist GSAP landing page base"
```

---

### Task 6: Cleanup and Typecheck

**Files:**
- Test: `npm run typecheck --workspace=packages/frontend`
- Test: `npm run lint --workspace=packages/frontend`

**Step 1: Ensure no TS errors**

Run standard type checks to ensure the transition to the new CSS classes and layout structural changes didn't break TS types in the component tree.

**Step 2: Commit**

```bash
git commit -am "chore: post-redesign type fixes"
```

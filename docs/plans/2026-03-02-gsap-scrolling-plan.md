# GSAP Scrolling Fixes & Sleek Maximalist Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix GSAP/Lenis synchronization issues causing janky scrolling, consolidate animations to pure GSAP, and implement a sleek maximalist aesthetic with consistent awwwards-level scrolling animations.

**Architecture:** We will create a robust `useIsomorphicLayoutEffect` hook to replace `useEffect` for ScrollTriggers. We will harden the `LenisProvider` GSAP ticker sync, explicitly removing lag smoothing. We will systematically strip out Anime.js from all landing page components to prevent engine conflicts, rewriting their animations into unified GSAP scrub and entrance timelines. We will remove all localized `ScrollTrigger.refresh()` calls to stop layout thrashing.

**Tech Stack:** Next.js 15+, React 19, GSAP (ScrollTrigger), @studio-freight/react-lenis, Tailwind CSS, Three.js (R3F)

---

### Task 1: Core Infrastructure (Isomorphic Effect & Lenis Sync)

**Files:**
- Create: `packages/frontend/src/hooks/use-isomorphic-layout-effect.ts`
- Modify: `packages/frontend/src/components/providers/LenisProvider.tsx`

**Step 1: Create useIsomorphicLayoutEffect**
This prevents SSR warnings while ensuring GSAP calculates before paint.

```typescript
// packages/frontend/src/hooks/use-isomorphic-layout-effect.ts
import { useEffect, useLayoutEffect } from 'react';

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
```

**Step 2: Update LenisProvider for Strict Sync**
Harden the GSAP/Lenis connection and handle centralized resizing.

```typescript
// packages/frontend/src/components/providers/LenisProvider.tsx (update LenisGsapSync and LenisProvider)
import { useEffect } from 'react';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
import { gsap, ScrollTrigger } from '@/lib/animations/gsap-config';
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect';

export function LenisProvider({ children }: { children: any }) {
  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    ScrollTrigger.clearScrollMemory('manual');

    // Centralized resize listener to refresh ScrollTrigger safely
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 250);
    };

    window.addEventListener('resize', handleResize);

    const timeout = setTimeout(() => {
      ScrollTrigger.refresh(true);
    }, 100);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <ReactLenis
      root
      autoRaf={false}
      options={{
        lerp: 0.05,
        duration: 1.5,
        smoothWheel: true,
        orientation: 'vertical',
        gestureOrientation: 'vertical'
      }}
    >
      <LenisGsapSync />
      {children}
    </ReactLenis>
  );
}

function LenisGsapSync() {
  const lenis = useLenis((lenis) => {
    ScrollTrigger.update();
  });

  useIsomorphicLayoutEffect(() => {
    if (lenis) {
      const rafCallback = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(rafCallback);
      gsap.ticker.lagSmoothing(0); // Critical for sync

      return () => {
        gsap.ticker.remove(rafCallback);
      };
    }
  }, [lenis]);

  return null;
}
```

**Step 3: Commit**
```bash
git add packages/frontend/src/hooks/use-isomorphic-layout-effect.ts packages/frontend/src/components/providers/LenisProvider.tsx
git commit -m "chore: setup strict lenis gsap sync and isomorphic effect hook"
```

---

### Task 2: CyberHero Consolidation & Wormhole Effect

**Files:**
- Modify: `packages/frontend/src/components/landing/new/CyberHero.tsx`

**Step 1: Remove Anime.js and use Isomorphic Layout Effect**
Remove `animejs` imports. Replace `useEffect` with `useIsomorphicLayoutEffect`.

**Step 2: Rewrite Entrance Animation in GSAP**
Replace the `anime()` block with a GSAP timeline for the text split entrance.

```typescript
// Inside useIsomorphicLayoutEffect in CyberHero.tsx:
const tlIn = gsap.timeline();
tlIn.to('.hero-char', {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
  duration: 1.2,
  stagger: 0.05,
  ease: 'power3.out',
  delay: 0.2
});
```

**Step 3: Update Wormhole Pinning**
Update the ScrollTrigger timeline. Remove `ScrollTrigger.refresh()`. Adjust scale to 8 for the wormhole effect.

```typescript
// Replace the old scroll trigger logic in CyberHero.tsx:
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: containerRef.current,
    start: 'top top',
    end: '+=150%',
    pin: true,
    scrub: 1.5, // Keep smooth scrubbing
    invalidateOnRefresh: true,
  }
});

tl.to('.hero-text-container', {
  scale: 8, // Increased for massive wormhole effect
  opacity: 0,
  filter: 'blur(30px)', // Intense blur
  ease: 'power2.inOut',
}, 0);

tl.to(ctaRef.current, { opacity: 0, y: -50, scale: 0.8, ease: 'power2.inOut' }, 0);
tl.to('.bg-grid', { scale: 3, opacity: 0, ease: 'power1.inOut' }, 0);
// REMOVE ScrollTrigger.refresh() from here
```

**Step 4: Commit**
```bash
git add packages/frontend/src/components/landing/new/CyberHero.tsx
git commit -m "feat: consolidate CyberHero to GSAP and enhance wormhole effect"
```

---

### Task 3: CyberGlobe Consolidation & Scroll-Linked 3D

**Files:**
- Modify: `packages/frontend/src/components/landing/new/CyberGlobe.tsx`

**Step 1: Remove Anime.js and switch to useIsomorphicLayoutEffect**
Strip `animejs` imports. Use the new effect hook.

**Step 2: GSAP Text Entrance Reveal**
Replace Anime.js code with GSAP `ScrollTrigger` batch reveal.

```typescript
// In CyberGlobe.tsx useIsomorphicLayoutEffect:
gsap.set('.globe-text', { opacity: 0, y: 40, filter: 'blur(15px)' });

ScrollTrigger.create({
  trigger: sectionRef.current,
  start: 'top 75%',
  onEnter: () => {
    gsap.to('.globe-text', {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out'
    });
  }
});
```

**Step 3: Scroll-Linked Parallax for R3F Canvas container**
Instead of trying to pass scroll progress directly into the R3F canvas (which is complex without `drei`'s `ScrollControls`), we will add a subtle parallax scrub to the entire globe container.

```typescript
// Below the text reveal logic in CyberGlobe.tsx:
gsap.to(globeContainerRef.current, {
  yPercent: 20,
  ease: 'none',
  scrollTrigger: {
    trigger: sectionRef.current,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  }
});

// REMOVE localized ScrollTrigger.refresh()
```

**Step 4: Commit**
```bash
git add packages/frontend/src/components/landing/new/CyberGlobe.tsx
git commit -m "feat: consolidate CyberGlobe to GSAP and add scroll parallax"
```

---

### Task 4: CyberFeatures Consolidation & 3D Tilt

**Files:**
- Modify: `packages/frontend/src/components/landing/new/CyberFeatures.tsx`

**Step 1: Replace Anime.js with GSAP**
Remove `animejs`. Use `useIsomorphicLayoutEffect`.

**Step 2: GSAP Entrance Stagger**
```typescript
// Inside useIsomorphicLayoutEffect
gsap.set('.features-header', { opacity: 0, y: 40, filter: 'blur(15px)' });
gsap.set('.feature-card', { opacity: 0, y: 60, scale: 0.95 });

ScrollTrigger.create({
  trigger: sectionRef.current,
  start: 'top 80%',
  onEnter: () => {
    gsap.to('.features-header', {
      y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out'
    });
  }
});

ScrollTrigger.create({
  trigger: gridRef.current,
  start: 'top 85%',
  onEnter: () => {
    gsap.to('.feature-card', {
      y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.1, ease: 'power3.out'
    });
  }
});
```

**Step 3: Custom 3D Tilt Hover Effect**
Replace Anime.js hover handlers with GSAP.

```typescript
// Replace handleCardMouseEnter / handleCardMouseLeave with GSAP equivalents
const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg tilt
  const rotateY = ((x - centerX) / centerX) * 10;

  gsap.to(card, {
    rotateX,
    rotateY,
    scale: 1.02,
    duration: 0.4,
    ease: 'power2.out',
    transformPerspective: 1000,
    transformOrigin: 'center center'
  });

  // Animate inner elements (glow, border lines) with GSAP similar to before
  gsap.to(card.querySelector('.inner-content'), { backgroundColor: 'rgba(0, 255, 65, 0.03)', duration: 0.4 });
  gsap.to(card.querySelector('.hover-glow'), { opacity: 1, duration: 0.4 });
  gsap.to(card.querySelectorAll('.border-line'), { opacity: 1, scaleX: 1, duration: 0.4, transformOrigin: 'center' });
};

const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
  const card = e.currentTarget;
  gsap.to(card, {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    duration: 0.6,
    ease: 'elastic.out(1, 0.5)'
  });

  gsap.to(card.querySelector('.inner-content'), { backgroundColor: 'rgba(5, 5, 5, 1)', duration: 0.4 });
  gsap.to(card.querySelector('.hover-glow'), { opacity: 0, duration: 0.4 });
  gsap.to(card.querySelectorAll('.border-line'), { opacity: 0, scaleX: 0, duration: 0.4 });
};

// Update JSX to use onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
```

**Step 4: Commit**
```bash
git add packages/frontend/src/components/landing/new/CyberFeatures.tsx
git commit -m "feat: consolidate CyberFeatures to GSAP and add 3D tilt hover"
```

---

### Task 5: CyberTimeline Sync & Cleanup

**Files:**
- Modify: `packages/frontend/src/components/landing/new/CyberTimeline.tsx`

**Step 1: Switch to useIsomorphicLayoutEffect and remove refresh**
Swap `useEffect` for `useIsomorphicLayoutEffect`.
Find any instances of `ScrollTrigger.refresh()` and remove them. Ensure the scrub on the timeline paths is set properly (e.g., `scrub: 1`).

**Step 2: Commit**
```bash
git add packages/frontend/src/components/landing/new/CyberTimeline.tsx
git commit -m "fix: sync CyberTimeline GSAP and remove rogue refresh"
```
# Landing Page Maximalist Scaffolding Design

## 1. Goal
Complete the ground-up scaffolding of the new "Maximalist Cyberpunk" landing page. This will replace the old `page.tsx` with a sequence of high-impact, kinetic React components drawn from premium UI libraries (Aceternity UI, 21st.dev) orchestrated by GSAP ScrollTrigger and Lenis smooth scrolling.

## 2. Core Architecture & Flow

### Scroll-driven Reveal Mechanism
The existing `CyberHero.tsx` will be wrapped in a GSAP timeline that pins it to the screen initially. As the user scrolls, the hero text will kinetically break apart, peel away, or aggressively scale up to reveal the content below it.

### Component Sequence Strategy
Below the hero, we will scaffold empty container wrappers specifically designed to house the following high-end UI components:

1.  **The Globe Section:** A massive 3D globe or animated dot map representing the decentralized network/infrastructure.
2.  **The Protocol Timeline:** A sticky scroll-reveal timeline showing the transaction flow (Scan -> AI -> Sign -> Settle).
3.  **The Features Grid:** A grid utilizing 3D Glare Cards or 3D Pin Cards for individual protocol benefits.

These sections will be tied together using continuous **Tracing Beams / Background Beams** that follow the user's scroll depth down the page.

### Navigation Header
The existing `<Navbar />` inside `page.tsx` will be completely removed. We will build a new `<CyberNav />` component that is ultra-minimalist, floating, and responds to scroll direction (hides on scroll down, reveals on scroll up).

## 3. Technology & Dependencies
-   **Dependencies Required:** We will need to install `framer-motion` (already in package.json), `clsx`, `tailwind-merge` (already present), and potentially `three.js` or `globe.gl` depending on the exact Aceternity globe implementation we choose in the next phase.
-   **Animation:** `gsap` + `ScrollTrigger` for section transitions; `framer-motion` for micro-interactions within the Aceternity components.

## 4. Execution Plan
1.  **Delete Old Artifacts:** Remove the old `<Navbar />` and `components/landing/*` remnants from the main `page.tsx`.
2.  **Build CyberNav:** Create an ultra-minimal floating header.
3.  **Update CyberHero:** Add the ScrollTrigger pinning and reveal logic to the existing hero text.
4.  **Scaffold Sections:** Create placeholder components (e.g., `CyberGlobe`, `CyberTimeline`, `CyberFeatures`) wrapped in the tracing beam layout.
5.  **Wire up `page.tsx`:** Assemble the new components into a single smooth-scrolling page.
# GSAP Scrolling & Awwwards-Level Consistency Design

## Overview
This document outlines the architectural and aesthetic changes required to fix the scroll-related bugs (stuttering, Lenis sync issues, trigger alignment, janky pinning) and implement a "Sleek Maximalist" Awwwards-level consistency across the landing page components.

## Core Architecture: Centralized ScrollTrigger & Lenis Sync
The current implementation suffers from competing animation engines (Anime.js vs. GSAP) and disjointed `ScrollTrigger.refresh()` calls causing infinite layout thrashing and jumping.

1.  **Strict Lenis/GSAP Ticker Sync:**
    *   Ensure GSAP's ticker is perfectly bound to Lenis's `raf` loop in `LenisProvider`.
    *   Explicitly disable GSAP's lag smoothing (`gsap.ticker.lagSmoothing(0)`) to prevent fighting.
2.  **Centralized Refresh Logic:**
    *   Remove all random `ScrollTrigger.refresh()` calls inside `setTimeout` blocks across `CyberHero`, `CyberGlobe`, `CyberFeatures`, etc.
    *   Rely entirely on the `LenisProvider` and `useIsomorphicLayoutEffect` to handle window resizing and DOM settling.
3.  **useIsomorphicLayoutEffect:**
    *   Migrate ScrollTrigger initializations from `useEffect` to a custom `useIsomorphicLayoutEffect` (safe for SSR/Next.js).
    *   This ensures GSAP calculates dimensions *before* the browser paints, eliminating flashes of unstyled content and incorrect initial pin positions.
4.  **Consolidate to GSAP:**
    *   Completely remove Anime.js from `CyberHero`, `CyberGlobe`, and `CyberFeatures`. The mixing of engines causes timing conflicts and lag. Everything will be driven by GSAP timelines tied to ScrollTrigger.

## Component Specific Refinements (Sleek Maximalist Aesthetic)

### 1. CyberHero (The Wormhole)
*   **Fix Pinning:** Ensure the pin duration perfectly matches the scrub duration, adding easing to the scrub (`scrub: 1.5`) for high-end fluid motion instead of snapping.
*   **Animation Refinement:** The "pass-through" effect will be made seamless. The text will scale massively (`scale: 8`) while intensely blurring out, creating a wormhole effect into the Globe section.

### 2. CyberGlobe (3D Integration)
*   **Reveal:** The globe section will reveal smoothly as the Hero section zooms past.
*   **Scroll-Linked Rotation:** Tie the Globe's 3D rotation slightly to the scroll progress (parallax on the rings) using a new ScrollTrigger, giving it weight and physical connection to the user's scrolling.
*   **Remove Anime.js:** The text reveals will be migrated entirely into GSAP timelines tied to ScrollTrigger.

### 3. CyberFeatures (3D Tilt & Glow)
*   **Remove Anime.js:** Replace Anime.js staggered entrance with GSAP staggered `ScrollTrigger` reveal. As you scroll into the section, the cards will rise and tilt into place smoothly.
*   **Hover Interaction:** Implement a subtle 3D tilt effect on hover (using pure GSAP/Vanilla JS) instead of just scaling, combined with the intense #00ff41 neon glow.

### 4. CyberTimeline
*   Connect the section to the centralized scroll logic. Ensure the line drawing animation scrubs perfectly with the scroll position, providing a clear visual thread.

## Execution Plan
1.  Create `useIsomorphicLayoutEffect` hook.
2.  Update `LenisProvider` for strict sync.
3.  Refactor `CyberHero`: Remove Anime.js, fix pinning, update GSAP timeline.
4.  Refactor `CyberGlobe`: Remove Anime.js, tie R3F rotation to scroll, update GSAP timeline.
5.  Refactor `CyberFeatures`: Remove Anime.js, implement 3D tilt hover, update GSAP timeline.
6.  Refactor `CyberTimeline`: Ensure centralized sync and perfect scrubbing.
7.  Global audit: Remove all rogue `ScrollTrigger.refresh()` calls.
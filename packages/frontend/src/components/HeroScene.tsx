'use client';

/**
 * HeroScene - Spline 3D Scene Container
 * Full-viewport 3D scene with Spline embed
 */

import { Suspense, useRef } from 'react';
import Spline from '@splinetool/react-spline';

interface HeroSceneProps {
  className?: string;
}

export function HeroScene({ className = '' }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${className}`}
      style={{ zIndex: 0 }}
    >
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#04040A' }}>
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          </div>
        }
      >
        <Spline
          scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </Suspense>
    </div>
  );
}
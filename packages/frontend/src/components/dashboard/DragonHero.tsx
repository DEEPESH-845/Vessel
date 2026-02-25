'use client';

/**
 * DragonHero - Full-bleed background illustration
 * Dragon image with particles and radial glow
 */

import Image from 'next/image';

interface DragonHeroProps {
  className?: string;
}

export function DragonHero({ className = '' }: DragonHeroProps) {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ left: '72px', right: '300px' }}>
      {/* Base gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: '#060b14',
        }}
      />
      
      {/* Radial glow at center */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(16, 28, 80, 0.6) 0%, #060b14 70%)',
        }}
      />
      
      {/* Dragon Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/dragon-hero.png"
          alt="Dragon"
          fill
          className="object-contain opacity-90"
          priority
        />
      </div>
      
      {/* Scattered particles */}
      {[...Array(20)].map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${2 + Math.random() * 2}px`,
            height: `${2 + Math.random() * 2}px`,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            opacity: 0.3 + Math.random() * 0.4,
            boxShadow: Math.random() > 0.7 ? '0 0 4px white' : 'none',
          }}
        />
      ))}
    </div>
  );
}
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function HeroMesh() {
  const meshRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!meshRef.current) return;

    // A subtle, slow-moving gradient mesh animation
    // Keeping it performant with CSS variables mapped through GSAP
    const ctx = gsap.context(() => {
      gsap.to(".mesh-blob-1", {
        x: "20vw",
        y: "10vh",
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(".mesh-blob-2", {
        x: "-15vw",
        y: "20vh",
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2
      });

      gsap.to(".mesh-blob-3", {
        x: "10vw",
        y: "-15vh",
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 5
      });
    }, meshRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={meshRef} 
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#0B0F17]"
    >
      {/* Grid overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
      />
      
      {/* Glowing orbs/blobs */}
      <div className="mesh-blob-1 absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[130px] mix-blend-screen" />
      <div className="mesh-blob-2 absolute top-[40%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-accent-cyan/10 blur-[120px] mix-blend-screen" />
      <div className="mesh-blob-3 absolute bottom-[10%] left-[30%] w-[45vw] h-[45vw] rounded-full bg-accent-purple/10 blur-[140px] mix-blend-screen" />
      
      {/* Noise filter to prevent banding and add premium texture */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}

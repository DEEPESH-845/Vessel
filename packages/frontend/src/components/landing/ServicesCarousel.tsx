'use client';

/**
 * ServicesCarousel Component
 * Card carousel with Framer Motion transitions
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { services, type Service } from '@/data/services';

const variants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

// 3D Object placeholder for each service
function ServiceVisual({ index }: { index: number }) {
  // Different visual for each service
  const visuals = [
    // Atom/Electron model
    <div key="atom" className="relative w-full h-full flex items-center justify-center">
      <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30" />
      <div className="absolute w-40 h-20 border border-violet-400/50 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
      <div className="absolute w-40 h-20 border border-violet-400/50 rounded-full animate-spin" style={{ animationDuration: '8s', transform: 'rotate(60deg)' }} />
      <div className="absolute w-40 h-20 border border-violet-400/50 rounded-full animate-spin" style={{ animationDuration: '8s', transform: 'rotate(-60deg)' }} />
    </div>,
    // Content creation - teardrop shape
    <div key="teardrop" className="relative w-full h-full flex items-center justify-center">
      <div className="w-32 h-40 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-t-full rounded-b-[50%] shadow-lg shadow-blue-500/30" />
      <div className="absolute right-1/4 bottom-1/4 w-12 h-12 bg-gradient-to-br from-blue-300 to-blue-500 rounded-lg shadow-lg shadow-blue-400/50 animate-pulse" />
    </div>,
    // Marketing - connected nodes
    <div key="nodes" className="relative w-full h-full flex items-center justify-center">
      <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-500/30" />
      <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-orange-500" />
      <div className="absolute bottom-1/4 right-1/4 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
      <div className="absolute top-1/3 right-1/3 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400" />
    </div>,
    // Community - network
    <div key="network" className="relative w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/20" />
        ))}
      </div>
    </div>,
    // Consulting - target
    <div key="target" className="relative w-full h-full flex items-center justify-center">
      <div className="w-32 h-32 rounded-full border-4 border-indigo-400/50 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full border-4 border-indigo-400/70 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 shadow-lg shadow-indigo-500/50" />
        </div>
      </div>
    </div>,
  ];

  return visuals[index] || visuals[0];
}

interface ServicesCarouselProps {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export function ServicesCarousel({ activeIndex, setActiveIndex }: ServicesCarouselProps) {
  const activeService = services[activeIndex];

  const goToPrevious = () => {
    setActiveIndex(activeIndex === 0 ? services.length - 1 : activeIndex - 1);
  };

  const goToNext = () => {
    setActiveIndex(activeIndex === services.length - 1 ? 0 : activeIndex + 1);
  };

  return (
    <div className="relative w-[340px] md:w-[440px]">
      {/* Card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(8, 8, 26, 0.88)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        }}
      >
        {/* 3D Visual Zone */}
        <div className="relative h-[280px] md:h-[300px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.32, 0, 0.67, 0] }}
              className="absolute inset-0"
            >
              <ServiceVisual index={activeIndex} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text Zone */}
        <div className="relative p-6 text-center border-t border-white/[0.06]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.32, 0, 0.67, 0] }}
            >
              <h3 className="text-xl font-semibold text-white mb-3">
                {activeService.title}
              </h3>
              <p className="text-[13.5px] text-white/60 leading-relaxed max-w-[320px] mx-auto">
                {activeService.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Bar */}
        <div
          className="h-12 flex items-center justify-center gap-6 border-t border-white/[0.06]"
          style={{ background: 'rgba(255, 255, 255, 0.03)' }}
        >
          {/* Left Arrow */}
          <button
            onClick={goToPrevious}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ background: 'rgba(255, 255, 255, 0.08)' }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Dot Indicators */}
          <div className="flex items-center gap-2">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={index === activeIndex ? 'w-6 h-1.5 rounded-full bg-white' : 'w-1.5 h-1.5 rounded-full bg-white/30'}
              />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={goToNext}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ background: 'rgba(255, 255, 255, 0.08)' }}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
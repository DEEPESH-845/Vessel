'use client';

/**
 * ServicesCarousel - Embla-based carousel
 * Drag-enabled card carousel with navigation
 */

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { services } from '@/data/services';

export function ServicesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <ChevronLeft className="w-6 h-6 text-white/70" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <ChevronRight className="w-6 h-6 text-white/70" />
      </button>

      {/* Carousel */}
      <div className="overflow-hidden px-16" ref={emblaRef}>
        <div className="flex">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="flex-none px-4"
              style={{ flex: '0 0 440px' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div
                className="relative overflow-hidden"
                style={{
                  width: '440px',
                  height: '460px',
                  borderRadius: '16px',
                  background: 'rgba(8, 8, 26, 0.88)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Card 3D Object - Spline or Image */}
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(59,130,246,0.3) 0%, transparent 70%)',
                    }}
                  >
                    {/* Placeholder for Spline 3D object */}
                    <div
                      className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500"
                      style={{
                        boxShadow: '0 0 40px rgba(59,130,246,0.5)',
                      }}
                    />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3
                    className="text-white font-bold mb-3"
                    style={{ fontSize: '22px' }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="text-white/60 leading-relaxed mb-6"
                    style={{ fontSize: '14px', lineHeight: 1.65 }}
                  >
                    {service.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      Web3
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      Payments
                    </span>
                  </div>
                </div>

                {/* Orbital Ring Decoration */}
                <div
                  className="absolute top-8 right-8 w-32 h-32 rounded-full pointer-events-none"
                  style={{
                    border: '1px solid rgba(200,180,255,0.2)',
                    transform: 'rotateX(65deg)',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="flex justify-center gap-2 mt-8">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className="transition-all"
            style={{
              width: index === selectedIndex ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: index === selectedIndex ? '#F97316' : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
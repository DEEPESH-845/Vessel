import { CyberHero } from '@/components/landing/new/CyberHero';
import { CyberNav } from '@/components/landing/new/CyberNav';
import { CyberGlobe } from '@/components/landing/new/CyberGlobe';
import { CyberTimeline } from '@/components/landing/new/CyberTimeline';
import { CyberFeatures } from '@/components/landing/new/CyberFeatures';

export default function Home() {
  return (
    <main className="bg-black min-h-screen text-white selection:bg-[#00ff41] selection:text-black overflow-x-hidden">
      <CyberNav />

      {/* Wrapping the content to contain the pinning context and tracing beam effects */}
      <div className="relative">
        <CyberHero />
        <CyberGlobe />
        <CyberTimeline />
        <CyberFeatures />
      </div>
    </main>
  );
}

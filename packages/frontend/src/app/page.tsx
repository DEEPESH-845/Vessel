import { CyberHero } from '@/components/landing/new/CyberHero';
import { CyberNav } from '@/components/landing/new/CyberNav';
import { CyberGlobe } from '@/components/landing/new/CyberGlobe';
import { CyberTimeline } from '@/components/landing/new/CyberTimeline';
import { CyberFeatures } from '@/components/landing/new/CyberFeatures';

export default function Home() {
  return (
    <main className="bg-black min-h-screen text-white selection:bg-[#00ff41] selection:text-black">
      <CyberNav />

      {/* Wrapping the content to contain the pinning context and tracing beam effects */}
      <div className="relative">
        <CyberHero />
        <CyberGlobe />
        <CyberTimeline />

        {/* Spacer before next section to give the timeline room to breathe */}
        <div className="h-24 md:h-32 lg:h-48 pointer-events-none" aria-hidden="true" />

        <CyberFeatures />
      </div>
    </main>
  );
}
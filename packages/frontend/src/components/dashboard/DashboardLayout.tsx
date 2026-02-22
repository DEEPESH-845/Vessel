'use client';

/**
 * DashboardLayout - Main 3-column layout
 * Combines Sidebar, DragonHero, TopBar, SwapPanel, and cards
 */

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DragonHero } from './DragonHero';
import { SwapPanel } from './SwapPanel';
import { PromoCodeModal } from './PromoCodeModal';
import { TVLCard } from './TVLCard';
import { VolumeCard } from './VolumeCard';

interface DashboardLayoutProps {
  showPromoModal?: boolean;
}

export function DashboardLayout({ showPromoModal = true }: DashboardLayoutProps) {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#060b14' }}>
      {/* Sidebar - 72px */}
      <Sidebar className="fixed left-0 top-0 z-30" />

      {/* Dragon Hero Background */}
      <DragonHero />

      {/* TopBar */}
      <TopBar className="fixed top-0 left-[72px] right-[300px] z-20" />

      {/* Promo Modal */}
      {showPromoModal && <PromoCodeModal />}

      {/* TVL Card */}
      <TVLCard />

      {/* Volume Card */}
      <VolumeCard />

      {/* Swap Panel - 300px */}
      <SwapPanel className="fixed right-0 top-0 z-30" />
    </div>
  );
}
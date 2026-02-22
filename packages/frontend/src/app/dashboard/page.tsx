"use client";

import { StatsCards } from "./_components/stats-cards";
import { PortfolioChart } from "./_components/portfolio-chart";
import { TradingPanel } from "./_components/trading-panel";
import { AssetsTable } from "./_components/assets-table";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stats Cards Row */}
      <StatsCards />

      {/* Analytics Section - Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Portfolio Chart - Takes 2 columns */}
        <div className="xl:col-span-2">
          <PortfolioChart />
        </div>

        {/* Trading Panel */}
        <div>
          <TradingPanel />
        </div>
      </div>

      {/* Assets Table */}
      <AssetsTable />
    </div>
  );
}

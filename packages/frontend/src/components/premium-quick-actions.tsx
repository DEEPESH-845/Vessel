/**
 * PremiumQuickActions Component
 * 
 * Enhanced version of QuickActionsGrid with magnetic buttons and staggered animations
 */

"use client";

import MagneticActionButton from "./magnetic-action-button";

export default function PremiumQuickActions() {
  return (
    <div
      className="grid grid-cols-2"
      style={{
        gap: "16px",
      }}
    >
      <MagneticActionButton
        href="/scan"
        delay={0.1}
        label="Scan QR"
        icon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#CCFF00"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <rect x="7" y="7" width="10" height="10" rx="1" />
          </svg>
        }
      />

      <MagneticActionButton
        href="/pay"
        delay={0.2}
        label="Pay"
        icon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#CCFF00"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        }
      />
    </div>
  );
}

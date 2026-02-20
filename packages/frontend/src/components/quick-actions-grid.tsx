/**
 * QuickActionsGrid Component
 * 
 * Provides quick access to primary wallet actions (Scan QR and Pay).
 * Follows the "Rise & Grind" design system with glassmorphism effects.
 * 
 * Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 2.8, 2.9, 8.5
 */

import React from "react";
import Link from "next/link";

/**
 * QuickActionsGrid displays two action buttons for scanning QR codes and initiating payments.
 * Uses Next.js Link components for navigation with the "Rise & Grind" design system styling.
 */
export default function QuickActionsGrid() {
  return (
    <div
      className="grid grid-cols-2"
      style={{
        gap: "24px", // Maintained across all breakpoints
      }}
    >
      {/* Scan QR Button - Touch target minimum 44x44px ensured by padding */}
      <Link
        href="/scan"
        className="relative overflow-hidden block transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: "#18181B",
          border: "1px solid #27272A",
          borderRadius: "24px",
          padding: "24px", // Ensures minimum 44x44px touch target
          minHeight: "120px", // Ensures adequate touch target size
          textDecoration: "none",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Glassmorphism overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            backdropFilter: "blur(24px) saturate(1.8)",
            WebkitBackdropFilter: "blur(24px) saturate(1.8)",
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-3">
          {/* Icon container with Neon Green accent */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(204, 255, 0, 0.1)",
              border: "1px solid rgba(204, 255, 0, 0.2)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CCFF00"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <rect x="7" y="7" width="10" height="10" rx="1" />
            </svg>
          </div>

          {/* Button text with Inter font */}
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "#FFFFFF",
              letterSpacing: "-0.01em",
            }}
          >
            Scan QR
          </span>
        </div>

        {/* Hover state - Neon Green accent glow */}
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(204, 255, 0, 0.08), transparent 70%)",
          }}
          aria-hidden="true"
        />
      </Link>

      {/* Pay Button - Touch target minimum 44x44px ensured by padding */}
      <Link
        href="/pay"
        className="relative overflow-hidden block transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: "#18181B",
          border: "1px solid #27272A",
          borderRadius: "24px",
          padding: "24px", // Ensures minimum 44x44px touch target
          minHeight: "120px", // Ensures adequate touch target size
          textDecoration: "none",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Glassmorphism overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            backdropFilter: "blur(24px) saturate(1.8)",
            WebkitBackdropFilter: "blur(24px) saturate(1.8)",
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-3">
          {/* Icon container with Neon Green accent */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(204, 255, 0, 0.1)",
              border: "1px solid rgba(204, 255, 0, 0.2)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CCFF00"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </div>

          {/* Button text with Inter font */}
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "#FFFFFF",
              letterSpacing: "-0.01em",
            }}
          >
            Pay
          </span>
        </div>

        {/* Hover state - Neon Green accent glow */}
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(204, 255, 0, 0.08), transparent 70%)",
          }}
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}

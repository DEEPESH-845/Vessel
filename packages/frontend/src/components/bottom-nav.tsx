"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import { Home, ScanLine, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/wallet", icon: Home, label: "Home" },
  { href: "/scan", icon: ScanLine, label: "Scan" },
  { href: "/wallet#activity", icon: Clock, label: "Activity" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <LayoutGroup>
      <nav
        className="bottom-nav glass-floating"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/wallet#activity"
                ? false // Activity is a section, not a separate page
                : pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl",
                  "transition-colors duration-200 focus-ring"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Active background pill */}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-primary/[0.08] border border-primary/10"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                    }}
                  />
                )}

                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="relative z-10"
                >
                  <item.icon
                    className={cn(
                      "w-[18px] h-[18px] transition-all duration-300",
                      isActive
                        ? "text-primary drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]"
                        : "text-muted-foreground/60"
                    )}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                </motion.div>

                <span
                  className={cn(
                    "text-[9px] font-medium tracking-wide transition-all duration-300 relative z-10",
                    isActive ? "text-primary" : "text-muted-foreground/50"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </LayoutGroup>
  );
}

"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  ArrowLeftRight,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Hexagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: TrendingUp, label: "Markets", href: "/dashboard/markets" },
  { icon: ArrowLeftRight, label: "Transactions", href: "/dashboard/transactions" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

/**
 * Sidebar — Navigation sidebar with collapsible state
 * 
 * Collapsed: 72px width, expanded: 250px width
 * Active state: gradient border glow on left edge
 * Background: var(--color-bg-surface)
 * Hover: subtle background shift
 */
export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "fixed left-0 top-0 h-screen z-50",
        "flex flex-col",
        "bg-[var(--color-bg-surface)]",
        "border-r border-[var(--color-border-subtle)]",
        isCollapsed ? "w-[72px]" : "w-[250px]"
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-subtle)]">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            {/* Logo Icon - Hexagon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-purple) 50%, var(--color-accent-cyan) 100%)",
              }}
            >
              <Hexagon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span
              className="text-lg font-semibold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Vessel
            </span>
          </motion.div>
        )}
        {isCollapsed && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto"
            style={{
              background: "linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-purple) 50%, var(--color-accent-cyan) 100%)",
            }}
          >
            <Hexagon className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all",
            isCollapsed && "hidden"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <button
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    "hover:bg-[var(--color-bg-elevated)]",
                    isActive
                      ? "bg-gradient-to-r from-[rgba(59,130,246,0.15)] to-[rgba(139,92,246,0.15)] text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 w-1 h-8 rounded-r-full"
                      style={{
                        background: "linear-gradient(180deg, var(--color-accent-blue) 0%, var(--color-accent-purple) 100%)",
                      }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive
                        ? "text-[var(--color-accent-blue)]"
                        : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-3 border-t border-[var(--color-border-subtle)]">
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl",
            "bg-[var(--color-bg-elevated)]",
            "hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer"
          )}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] flex items-center justify-center text-white font-medium text-sm">
            D
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">Deepesh</p>
              <p className="text-xs text-[var(--color-text-secondary)] truncate">deepesh@example.com</p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-red-neg)] hover:bg-[rgba(239,68,68,0.1)] transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

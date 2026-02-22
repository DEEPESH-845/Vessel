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
        "bg-[#0A0E18]",
        "border-r border-[rgba(255,255,255,0.04)]",
        isCollapsed ? "w-[72px]" : "w-[250px]"
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-5 border-b border-[rgba(255,255,255,0.04)]">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #4F7CFF 0%, #7C4DFF 50%, #06B6D4 100%)",
              }}
            >
              <span className="text-lg font-bold text-white">V</span>
            </div>
            <span
              className="text-lg font-semibold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Vessel
            </span>
          </motion.div>
        )}
        {isCollapsed && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto"
            style={{
              background: "linear-gradient(135deg, #4F7CFF 0%, #7C4DFF 50%, #06B6D4 100%)",
            }}
          >
            <span className="text-lg font-bold text-white">V</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-lg text-[#8490A8] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all",
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
                    "hover:bg-[rgba(255,255,255,0.04)]",
                    isActive
                      ? "bg-gradient-to-r from-[rgba(79,124,255,0.15)] to-[rgba(124,77,255,0.15)] text-white"
                      : "text-[#8490A8] hover:text-white"
                  )}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 w-1 h-8 rounded-r-full"
                      style={{
                        background: "linear-gradient(180deg, #4F7CFF 0%, #7C4DFF 100%)",
                      }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive
                        ? "text-[#4F7CFF]"
                        : "text-[#8490A8] group-hover:text-white"
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
      <div className="p-3 border-t border-[rgba(255,255,255,0.04)]">
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl",
            "bg-[rgba(255,255,255,0.02)]",
            "hover:bg-[rgba(255,255,255,0.04)] transition-colors cursor-pointer"
          )}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4F7CFF] to-[#7C4DFF] flex items-center justify-center text-white font-medium text-sm">
            D
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Deepesh</p>
              <p className="text-xs text-[#8490A8] truncate">deepesh@example.com</p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#8490A8] hover:text-red-400 hover:bg-[rgba(244,63,94,0.1)] transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

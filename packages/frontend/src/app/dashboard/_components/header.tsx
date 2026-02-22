"use client";

import { motion } from "framer-motion";
import { Search, Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

export function Header({ title, onMenuToggle }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "sticky top-0 z-40",
        "flex items-center justify-between",
        "h-16 px-6",
        "bg-[rgba(11,15,25,0.8)]",
        "backdrop-blur-xl",
        "border-b border-[rgba(255,255,255,0.04)]"
      )}
    >
      {/* Left: Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-[#8490A8] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1
          className="text-xl font-semibold text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </h1>
      </div>

      {/* Right: Search, Notifications, User */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8490A8]" />
          <input
            type="text"
            placeholder="Search assets, transactions..."
            className={cn(
              "w-64 h-10 pl-10 pr-4 rounded-xl",
              "bg-[rgba(255,255,255,0.04)]",
              "border border-[rgba(255,255,255,0.06)]",
              "text-sm text-white placeholder:text-[#8490A8]",
              "focus:outline-none focus:border-[rgba(79,124,255,0.4)]",
              "transition-all duration-200"
            )}
          />
        </div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative p-2.5 rounded-xl",
            "bg-[rgba(255,255,255,0.04)]",
            "text-[#8490A8] hover:text-white",
            "hover:bg-[rgba(255,255,255,0.08)]",
            "transition-all duration-200"
          )}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4F7CFF]" />
        </motion.button>

        {/* User Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-10 h-10 rounded-full",
            "bg-gradient-to-br from-[#4F7CFF] to-[#7C4DFF]",
            "flex items-center justify-center",
            "text-white font-medium text-sm",
            "cursor-pointer",
            "ring-2 ring-[rgba(255,255,255,0.1)]",
            "hover:ring-[rgba(79,124,255,0.4)]",
            "transition-all duration-200"
          )}
        >
          D
        </motion.div>
      </div>
    </motion.header>
  );
}

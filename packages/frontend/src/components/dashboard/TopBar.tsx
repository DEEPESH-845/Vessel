"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * TopBar — Top navigation bar with search and profile dropdown
 * 
 * Search: glow focus state
 * Profile: dropdown with avatar and menu
 * Background: var(--color-bg-surface) with blur
 */
export function TopBar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 border-b border-[var(--color-border-subtle)]"
      style={{
        background: "var(--color-bg-surface)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <motion.div
          animate={{
            boxShadow: searchFocused 
              ? "0 0 0 1px var(--color-accent-blue), 0 0 20px rgba(59,130,246,0.2)" 
              : "none"
          }}
          className={cn(
            "relative flex items-center rounded-xl transition-all duration-200",
            "bg-[var(--color-bg-elevated)] border",
            searchFocused 
              ? "border-[var(--color-accent-blue)]" 
              : "border-[var(--color-border-subtle)]"
          )}
        >
          <Search className="absolute left-3 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search tokens, transactions..."
            className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </motion.div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-accent-blue)] transition-all"
        >
          <Bell className="w-4 h-4 text-[var(--color-text-secondary)]" />
          {/* Notification dot */}
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-accent-cyan)]" />
        </motion.button>

        {/* Profile Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setProfileOpen(!profileOpen)}
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl",
              "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
              "hover:border-[var(--color-accent-blue)] transition-all",
              profileOpen && "border-[var(--color-accent-blue)]"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] flex items-center justify-center text-white font-medium text-sm">
              D
            </div>
            <span className="text-sm text-[var(--color-text-primary)] hidden sm:block">Deepesh</span>
            <motion.div
              animate={{ rotate: profileOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
            </motion.div>
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] shadow-xl"
              >
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors">
                  <User className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors">
                  <Settings className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  Settings
                </button>
                <div className="my-2 border-t border-[var(--color-border-subtle)]" />
                <button 
                  onClick={() => window.location.href = "/api/auth/logout"}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-red-neg)] hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}

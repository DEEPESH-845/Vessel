"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./_components/sidebar";
import { Header } from "./_components/header";
import { cn } from "@/lib/utils";

function LoadingState() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "#0B0F19" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-2 border-[#4F7CFF] border-t-transparent"
        />
        <p className="text-sm text-[#8490A8]">Loading...</p>
      </motion.div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!data.user) {
          router.replace("/");
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/");
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return <LoadingState />;
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#0B0F19" }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Central glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(79, 124, 255, 0.08) 0%, rgba(124, 77, 255, 0.04) 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Top right glow */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(124, 77, 255, 0.06) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Bottom left glow */}
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(6, 182, 212, 0.04) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className={cn(
          "relative z-10 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "ml-[72px]" : "ml-[250px]"
        )}
      >
        <Header
          title="Dashboard"
          onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

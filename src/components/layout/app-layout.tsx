
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams } from "next/navigation";
import type { Role } from "@/lib/types";
import { useUser } from "@/contexts/user-context";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  const isEffectivelyCollapsed = isMobile ? true : isSidebarCollapsed;

  return (
    <div
      className={cn(
        "grid min-h-screen w-full",
        !isEffectivelyCollapsed ? "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]" : "md:grid-cols-[64px_1fr]"
      )}
    >
      <Sidebar isCollapsed={isEffectivelyCollapsed} onMenuClick={toggleSidebar} />
      <div className="flex flex-col">
        <Header isCollapsed={isEffectivelyCollapsed} />
        {children}
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  )
}

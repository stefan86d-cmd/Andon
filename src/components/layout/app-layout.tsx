
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams } from "next/navigation";
import { users } from "@/lib/data";
import type { Role } from "@/lib/types";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as Role;

  useEffect(() => {
    if (role === 'admin' || role === 'operator') {
      users.setCurrent(role);
    }
  }, [role]);

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

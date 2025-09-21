
"use client";

import React, { Suspense } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const isMobile = useIsMobile();
  const { currentUser, loading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, loading, router]);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  const isEffectivelyCollapsed = isMobile ? true : isSidebarCollapsed;

  if (loading || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid min-h-screen w-full",
        !isEffectivelyCollapsed ? "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]" : "md:grid-cols-[64px_1fr]"
      )}
    >
      <Sidebar isCollapsed={isEffectivelyCollapsed} />
      <div className="flex flex-col">
        <Header isCollapsed={isEffectivelyCollapsed} onMenuClick={toggleSidebar} />
        {children}
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
    }>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  )
}

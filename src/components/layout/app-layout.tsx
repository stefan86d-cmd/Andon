
"use client";

import React, { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <div className="flex flex-col">
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

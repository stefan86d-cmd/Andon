
"use client";

import React, { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { useUser } from "@/contexts/user-context";
import { useRouter, usePathname } from "next/navigation";
import { LoaderCircle } from "lucide-react";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/login' || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');
  const isRegisterPage = pathname.startsWith('/register');

  React.useEffect(() => {
    if (loading) {
      return; // Do nothing while loading
    }
    
    // If not loading and not logged in, redirect to login page if not on a public/auth page.
    if (!currentUser && !isAuthPage) {
      router.replace('/login');
    }
    
    // If logged in, redirect away from login/password reset pages, but allow access to register/upgrade page.
    if (currentUser && isAuthPage && !isRegisterPage) {
      const path = currentUser.role === 'operator' ? '/line-status' : '/dashboard';
      router.replace(path);
    }

  }, [currentUser, loading, router, pathname, isAuthPage, isRegisterPage]);

  // While loading, if we are on a protected route, show a loader.
  if (loading && !isAuthPage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not logged in and on a protected route, show a loader until the redirect happens.
  if (!currentUser && !isAuthPage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // If logged in and on a non-register auth page, show a loader until the redirect happens.
  if (currentUser && isAuthPage && !isRegisterPage) {
    return (
       <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
       {/* Only show header if user is logged in and not on a full-screen auth page */}
       {currentUser && !isAuthPage && <Header />}
       {/* Or if user is logged-in and on the register page to upgrade plan */}
       {currentUser && isRegisterPage && <Header />}
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

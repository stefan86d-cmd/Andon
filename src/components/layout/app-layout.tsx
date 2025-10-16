
"use client";

import React, { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { useUser } from "@/contexts/user-context";
import { useRouter, usePathname } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { ThemeProvider } from "./theme-provider";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  const authPages = ['/login', '/register', '/complete-profile', '/forgot-password', '/reset-password', '/checkout'];
  const isAuthPage = authPages.some(page => pathname.startsWith(page));
  
  const publicPages = ['/', '/pricing', '/about', '/services', '/support', '/terms'];
  const isPublicPage = publicPages.some(page => pathname === '/' || (page !== '/' && pathname.startsWith(page)));

  React.useEffect(() => {
    if (loading) {
      return; // Wait for user status to be determined
    }

    if (currentUser) {
      // User is logged in
      if (!currentUser.role) {
        // Profile is incomplete, force completion
        if (!pathname.startsWith('/complete-profile') && !pathname.startsWith('/register')) {
           router.replace(`/complete-profile?plan=${currentUser.plan || 'starter'}`);
        }
      } else {
        // Profile is complete, redirect from auth/public pages to their correct dashboard
        if (isAuthPage || isPublicPage) {
           const path = currentUser.role === 'operator' ? '/line-status' : '/dashboard';
           router.replace(path);
        }
      }
    } else {
      // User is not logged in, restrict access to protected pages
      if (!isPublicPage && !isAuthPage) {
        router.replace('/login');
      }
    }
  }, [currentUser, loading, router, pathname, isAuthPage, isPublicPage]);

  // --- Render Logic ---

  // While loading, show a full-page loader to prevent content flash
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If we are still waiting for a redirect to happen, show a loader
  if (!currentUser && !isPublicPage && !isAuthPage) {
     return (
        <div className="flex h-screen items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  if (currentUser && currentUser.role && (isAuthPage || isPublicPage)) {
     return (
        <div className="flex h-screen items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
    );
  }
   if (currentUser && !currentUser.role && !pathname.startsWith('/complete-profile') && !pathname.startsWith('/register')) {
     return (
        <div className="flex h-screen items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  const showHeader = currentUser && currentUser.role && !isAuthPage && !isPublicPage;

  if (showHeader) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <div className="flex min-h-screen w-full flex-col">
          <Header />
          <div className="flex flex-col">
            {children}
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return <>{children}</>
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


"use client";

import React, { Suspense, useEffect } from "react";
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

  useEffect(() => {
    if (loading) {
      return; // Wait for user status to be determined
    }

    // If user is logged in...
    if (currentUser) {
      // and their profile is incomplete, force them to the profile completion page.
      if (!currentUser.role) {
        if (!pathname.startsWith('/complete-profile')) {
           router.replace(`/complete-profile?plan=${currentUser.plan || 'starter'}`);
        }
      } 
      // If their profile is complete and they are on a public or auth page,
      // redirect them to their appropriate dashboard.
      else if (isPublicPage || isAuthPage) {
        const path = currentUser.role === 'operator' ? '/line-status' : '/dashboard';
        router.replace(path);
      }
    } 
    // If user is not logged in, block access to protected pages.
    else if (!isPublicPage && !isAuthPage) {
      router.replace('/login');
    }
  }, [currentUser, loading, router, pathname, isAuthPage, isPublicPage]);

  // --- Render Logic ---

  // Show a full-page loader while the initial user state is being determined.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Determine if the main app header should be shown.
  const showHeader = currentUser && currentUser.role && !isAuthPage && !isPublicPage;

  if (showHeader) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme={currentUser.theme || "light"}
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

  // For public pages or auth pages, just render the content.
  return <>{children}</>;
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

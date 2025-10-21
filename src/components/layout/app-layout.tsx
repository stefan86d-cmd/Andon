
"use client";

import React, { Suspense, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { useUser } from "@/contexts/user-context";
import { useRouter, usePathname } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { ThemeProvider } from "./theme-provider";
import { useTheme } from "next-themes";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useUser();
  const { setTheme, theme } = useTheme();
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
        // Sync the theme from the user's profile
        if (currentUser.theme && theme !== currentUser.theme) {
            setTheme(currentUser.theme);
        }

      // and their profile is incomplete, force them to the profile completion page.
      if (!currentUser.role) {
        const plan = searchParams.get('plan') || currentUser.plan || 'starter';
        if (!pathname.startsWith('/complete-profile')) {
           router.replace(`/complete-profile?plan=${plan}`);
        }
        return; // Stop further checks until profile is complete
      } 

      // If the user is an operator, ensure they are always on the line-status page.
      if (currentUser.role === 'operator' && pathname !== '/line-status') {
          // Allow access to settings page
          if (pathname.startsWith('/settings')) {
              return;
          }
          router.replace('/line-status');
          return;
      }
      
      // If their profile is complete and they are on a public or auth page,
      // redirect them to their appropriate dashboard (if not an operator).
      if ((isPublicPage || isAuthPage) && currentUser.role !== 'operator' && !pathname.startsWith('/checkout/success')) {
        router.replace('/dashboard');
      }
    } 
    // If user is not logged in...
    else {
      // Force light mode on all public and auth pages if not already set
      if (theme !== 'light') {
        setTheme('light');
      }
      // and block access to protected pages.
      if (!isPublicPage && !isAuthPage) {
        router.replace('/login');
      }
    }
  }, [currentUser, loading, router, pathname, isAuthPage, isPublicPage, setTheme, theme]);

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
  const showHeader = currentUser && currentUser.role && !isAuthPage && !isPublicPage && !pathname.startsWith('/checkout');

  if (showHeader) {
    return (
        <div className="flex min-h-screen w-full flex-col">
          <Header />
          <div className="flex flex-col">
            {children}
          </div>
        </div>
    );
  }

  // For public pages or auth pages, just render the content.
  return <>{children}</>;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        }>
          <AppLayoutContent>{children}</AppLayoutContent>
        </Suspense>
      </ThemeProvider>
  )
}

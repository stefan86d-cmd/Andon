
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
  
  const authPages = ['/login', '/register', '/complete-profile', '/forgot-password', '/reset-password', '/checkout'];
  const isAuthPage = authPages.some(page => pathname.startsWith(page));
  
  const publicPages = ['/', '/pricing', '/about', '/services', '/support', '/terms'];
  const isPublicPage = publicPages.some(page => pathname === '/' || (page !== '/' && pathname.startsWith(page)));


  React.useEffect(() => {
    if (loading) {
      return; // Do nothing while loading
    }
    
    if (currentUser) {
       // If user profile is not complete (e.g., no role), force to complete-profile page.
       if (!currentUser.role && pathname !== '/complete-profile') {
           router.replace('/complete-profile');
           return;
       }
       
       // If logged in and profile is complete, redirect away from auth pages.
       if (isAuthPage && pathname !== '/checkout' && pathname !== '/complete-profile') {
          const path = currentUser.role === 'operator' ? '/line-status' : '/dashboard';
          router.replace(path);
          return;
       }
       
       // Redirect from public pages to the dashboard if logged in and profile is complete.
       if (isPublicPage && currentUser.role) {
          const path = currentUser.role === 'operator' ? '/line-status' : '/dashboard';
          router.replace(path);
          return;
       }
    } else {
        // If not loading and not logged in, and not on a public/auth page, redirect to home.
        if (!isPublicPage && !isAuthPage) {
            router.replace('/');
        }
    }

  }, [currentUser, loading, router, pathname, isAuthPage, isPublicPage]);
  
  const showHeader = currentUser && currentUser.role && !isAuthPage && !isPublicPage;

  if (loading && !isAuthPage && !isPublicPage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  return (
    <div className="flex min-h-screen w-full flex-col">
       {showHeader && <Header />}
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

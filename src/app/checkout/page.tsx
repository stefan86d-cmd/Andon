
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function CheckoutRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    toast({
      title: "Page Not Found",
      description: "This page is no longer in use. Please select a plan from our pricing page.",
      variant: "destructive",
    });
    router.replace('/pricing');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <LoaderCircle className="h-8 w-8 animate-spin" />
    </div>
  );
}

    
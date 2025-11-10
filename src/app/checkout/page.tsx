
"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { LoaderCircle, Copy, Check } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type Duration = "1" | "12" | "24" | "48";
type Currency = "usd" | "eur" | "gbp";

const tiers = [
  { name: "Standard", id: "standard", prices: { "1": { usd: 39.99, eur: 36.99, gbp: 32.99 }, "12": { usd: 31.99, eur: 29.59, gbp: 26.39 }, "24": { usd: 27.99, eur: 25.89, gbp: 23.09 }, "48": { usd: 23.99, eur: 22.19, gbp: 19.79 } } },
  { name: "Pro", id: "pro", prices: { "1": { usd: 59.99, eur: 54.99, gbp: 49.99 }, "12": { usd: 47.99, eur: 43.99, gbp: 39.99 }, "24": { usd: 41.99, eur: 38.49, gbp: 34.99 }, "48": { usd: 35.99, eur: 32.99, gbp: 29.99 } } },
  { name: "Enterprise", id: "enterprise", prices: { "1": { usd: 149.99, eur: 139.99, gbp: 124.99 }, "12": { usd: 119.99, eur: 111.99, gbp: 99.99 }, "24": { usd: 104.99, eur: 97.99, gbp: 87.49 }, "48": { usd: 89.99, eur: 83.99, gbp: 74.99 } } }
];

const promotionCodes: { [key in Duration]?: string } = {
  "12": "YAPPQ2YO",
  "24": "TQ4IVSRD",
  "48": "ALRLAVQ8",
};

const currencySymbols: Record<Currency, string> = {
  "usd": "$",
  "eur": "€",
  "gbp": "£"
};

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = React.useState(false);

  const planId = searchParams.get('plan') as string;
  const duration = (searchParams.get('duration') || '1') as Duration;
  const currency = (searchParams.get('currency') || 'usd') as Currency;

  const tier = tiers.find(t => t.id === planId);
  const promoCode = promotionCodes[duration];

  const copyToClipboard = () => {
    if (promoCode) {
      navigator.clipboard.writeText(promoCode).then(() => {
        setCopied(true);
        toast({ title: "Copied!", description: "Promotion code copied to clipboard." });
        setTimeout(() => setCopied(false), 2000);
      }, () => {
        toast({ title: "Failed to copy", description: "Could not copy code. Please copy it manually.", variant: "destructive" });
      });
    }
  };

  if (!tier) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-semibold">Invalid Plan</h2>
        <p className="text-muted-foreground">The selected plan is not valid. Please go back and select a plan.</p>
        <Button asChild>
          <Link href="/pricing">Go to Pricing</Link>
        </Button>
      </div>
    );
  }

  const price = tier.prices[duration]?.[currency] ?? 0;
  const registrationHref = `/register?plan=${planId}&duration=${duration}&currency=${currency}`;
  const getDurationText = () => {
      if (duration === '1') return 'Monthly';
      return `${duration} Months`;
  }

  return (
    <div className="bg-muted min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/"><Logo /></Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Checkout Summary</CardTitle>
            <CardDescription>You are signing up for the {tier.name} plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{tier.name} Plan</h3>
                <p className="text-sm text-muted-foreground">{getDurationText()}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{currencySymbols[currency]}{price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">/ month</p>
              </div>
            </div>

            {promoCode && (
              <div className="space-y-3 text-center">
                <p className="text-sm text-muted-foreground">
                  You've selected a multi-month plan! Use the code below on the Stripe checkout page to get your discount.
                </p>
                <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg">
                  <span className="font-mono text-lg font-semibold">{promoCode}</span>
                  <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={registrationHref}>Proceed to Registration</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AndonPro. All rights reserved.
        </footer>
    </div>
  );
}


export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    )
}

    
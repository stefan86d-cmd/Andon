"use client";

import React, { Suspense, useState } from 'react';
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
import { LoaderCircle } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { toast } from '@/hooks/use-toast';
import type { Currency } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth'; // ✅ assumes you have a user context hook

const tiers = [
  { name: "Standard", id: "standard", price: { usd: 29, eur: 27, gbp: 24 } },
  { name: "Pro", id: "pro", price: { usd: 59, eur: 54, gbp: 48 } },
  { name: "Enterprise", id: "enterprise", price: { usd: 99, eur: 92, gbp: 82 } },
];

const currencySymbols: Record<Currency, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
};

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth(); // ✅ current Firebase user
  const [loading, setLoading] = useState(false);

  const planId = searchParams.get("plan") as string;
  const currency = (searchParams.get("currency") || "usd") as Currency;
  const tier = tiers.find((t) => t.id === planId);

  if (!tier) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-semibold">Invalid Plan</h2>
        <p className="text-muted-foreground">
          The selected plan is not valid. Please go back and select a plan.
        </p>
        <Button asChild>
          <Link href="/pricing">Go to Pricing</Link>
        </Button>
      </div>
    );
  }

  const price = tier.price[currency] ?? 0;
  const registrationHref = `/register?plan=${planId}&currency=${currency}`;

  // ✅ Use dynamic checkout session for existing users
  const handleStripeCheckout = async () => {
    if (!user) {
      toast({
        title: "Please sign in first",
        description: "You need an account to subscribe.",
      });
      router.push(`/login?redirect=/checkout?plan=${planId}&currency=${currency}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          plan: planId,
          currency,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create Stripe checkout link.");
      }
    } catch (err: any) {
      console.error("Stripe Checkout Error:", err);
      toast({
        title: "Checkout error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Checkout Summary</CardTitle>
            <CardDescription>
              You are signing up for the {tier.name} plan.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{tier.name} Plan</h3>
                <p className="text-sm text-muted-foreground">Monthly</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">
                  {currencySymbols[currency]}
                  {price.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">/ month</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            {/* Register flow */}
            <Button asChild className="w-full">
              <Link href={registrationHref}>Proceed to Registration</Link>
            </Button>

            <p className="text-xs text-muted-foreground">
              Or, if you already have an account:
            </p>

            <Button
              onClick={handleStripeCheckout}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                "Pay with Stripe"
              )}
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
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}

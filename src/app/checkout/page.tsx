
"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { LoaderCircle, Check } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import type { Currency, Plan } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

type Duration = "1" | "12" | "24" | "48";

const tiers = [
  {
    name: "Standard",
    id: "standard",
    prices: {
      "1": { usd: 39.99, eur: 36.99, gbp: 32.99 },
      "12": { usd: 31.99, eur: 29.59, gbp: 26.39 },
      "24": { usd: 27.99, eur: 25.89, gbp: 23.09 },
      "48": { usd: 23.99, eur: 22.19, gbp: 19.79 },
    },
    features: [
      "Up to 80 users",
      "Up to 5 Production Lines",
      "Up to 10 workstations per line",
      "Advanced Reporting & Analytics",
      "User Role Management",
    ],
  },
  {
    name: "Pro",
    id: "pro",
    prices: {
      "1": { usd: 59.99, eur: 54.99, gbp: 49.99 },
      "12": { usd: 47.99, eur: 43.99, gbp: 39.99 },
      "24": { usd: 41.99, eur: 38.49, gbp: 34.99 },
      "48": { usd: 35.99, eur: 32.99, gbp: 29.99 },
    },
     features: [
      "Up to 150 users",
      "Up to 10 Production Lines",
      "Up to 15 workstations per line",
      "Advanced Reporting & Analytics",
      "User Role Management",
      "Priority Support",
    ],
  },
  {
    name: "Enterprise",
    id: "enterprise",
    prices: {
      "1": { usd: 149.99, eur: 139.99, gbp: 124.99 },
      "12": { usd: 119.99, eur: 111.99, gbp: 99.99 },
      "24": { usd: 104.99, eur: 97.99, gbp: 87.49 },
      "48": { usd: 89.99, eur: 83.99, gbp: 74.99 },
    },
    features: [
      "Up to 400 users",
      "20 Production Lines",
      "Up to 20 workstations per line",
      "User Role Management",
      "Advanced Reporting & Analytics",
      "24/7 Priority Support",
    ],
  },
];

const currencySymbols: Record<Currency, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
};

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  
  const planId = searchParams.get("plan") as Plan;
  const currency = (searchParams.get("currency") || "usd") as Currency;
  const duration = (searchParams.get("duration") || "1") as Duration;
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

  const currentPrice = tier.prices[duration]?.[currency] ?? 0;
  const originalPrice = tier.prices["1"]?.[currency] ?? 0;
  const showDiscount = duration !== "1" && currentPrice < originalPrice;
  const totalSavings = showDiscount ? (originalPrice - currentPrice) * parseInt(duration) : 0;

  const registrationHref = `/register?plan=${planId}&duration=${duration}&currency=${currency}`;
  const loginHref = `/login?redirect=/settings/billing?plan=${planId}&duration=${duration}&currency=${currency}`;

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
            <div className="p-4 border rounded-lg bg-background/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{tier.name} Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Billed monthly
                    {duration !== '1' && `, for ${duration} months`}
                  </p>
                  {duration === '12' && <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~20%</Badge>}
                  {duration === '24' && <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~30%</Badge>}
                  {duration === '48' && <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~40%</Badge>}
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                      {showDiscount && (
                           <span className="text-muted-foreground line-through">
                              {currencySymbols[currency]}{originalPrice.toFixed(2)}
                           </span>
                      )}
                      <p className="text-xl font-bold">
                          {currencySymbols[currency]}{currentPrice.toFixed(2)}
                      </p>
                  </div>
                  <p className="text-sm text-muted-foreground">/ month</p>
                </div>
              </div>
              {showDiscount && (
                  <div className="text-right mt-1 text-xs font-semibold text-green-600">
                      Save {currencySymbols[currency]}{totalSavings.toFixed(2)} over {duration} months
                  </div>
              )}
              <ul className="space-y-2 mt-4 pt-4 border-t">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Button asChild className="w-full">
              <Link href={registrationHref}>Proceed to Registration</Link>
            </Button>
            <div className="text-xs text-muted-foreground mt-3 text-center min-h-[36px]">
              {duration !== '1' ? (
                  <>
                      Renews at {currencySymbols[currency]}{originalPrice.toFixed(2)}/month after {duration} months.
                      <br/>
                      Promotional pricing applies to the initial term only.
                  </>
              ) : (
                  "Billed monthly. Cancel anytime."
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href={loginHref} className="underline">
                Sign in to complete your purchase
              </Link>
            </p>
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

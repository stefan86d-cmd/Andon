"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { LoaderCircle, Check, Copy, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/layout/logo";
import { toast } from "@/hooks/use-toast";
import { stripePayLinks } from "@/lib/stripe-pay-links";
import type { Currency } from "@/lib/types";

const tiers = [
  {
    id: "standard",
    name: "Standard",
    description: "Ideal for small teams managing a few lines.",
    features: [
      "Up to 5 production lines",
      "Real-time issue tracking",
      "Basic analytics dashboard",
    ],
    price: { usd: 29, eur: 27, gbp: 24 },
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing factories needing insights & team roles.",
    features: [
      "Up to 20 lines",
      "Full analytics & export",
      "Role-based access control",
      "Priority support",
    ],
    price: { usd: 59, eur: 54, gbp: 48 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large-scale plants and multi-site operations.",
    features: [
      "Unlimited lines",
      "Custom dashboards",
      "Dedicated success manager",
      "Advanced reporting API",
    ],
    price: { usd: 99, eur: 92, gbp: 82 },
  },
];

const currencySymbols: Record<Currency, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
};

function PricingPageContent() {
  const [currency, setCurrency] = useState<Currency>("usd");
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ title: "Copied!", description: "Discount code copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-muted min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-6xl">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold">Choose Your Plan</h2>
          <p className="text-muted-foreground mt-2">
            Get started with AndonPro today. Upgrade anytime.
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <SelectTrigger className="w-40">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <SelectValue placeholder="Currency" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD</SelectItem>
              <SelectItem value="eur">EUR</SelectItem>
              <SelectItem value="gbp">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const payLink = stripePayLinks[tier.id]?.[currency];
            return (
              <Card key={tier.id} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">{tier.name}</CardTitle>
                  <p className="text-muted-foreground text-center mt-1">{tier.description}</p>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-4xl font-bold">
                    {currencySymbols[currency]}
                    {tier.price[currency].toFixed(2)}
                    <span className="text-muted-foreground text-base font-normal">/month</span>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button asChild className="w-full">
                    <Link href={payLink ?? "#"} target="_blank">
                      Subscribe
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AndonPro. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <PricingPageContent />
    </Suspense>
  );
}

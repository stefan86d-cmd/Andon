
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { LoaderCircle, Globe } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useState, useEffect, useTransition, Suspense, useCallback } from "react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import type { Currency, Plan } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CancelSubscriptionDialog } from "@/components/settings/cancel-subscription-dialog";
import { Logo } from "@/components/layout/logo";
import { format, isValid } from "date-fns";
import { cancelSubscription, createCheckoutSession } from "@/app/actions";
import { useSearchParams } from 'next/navigation';
import { EmbeddedCheckoutForm } from "@/components/checkout/embedded-checkout-form";
import { Badge } from "@/components/ui/badge";

type Duration = "1" | "12" | "24" | "48";

const tiers: Record<Exclude<Plan, "custom" | "starter">, any> = {
  standard: {
    name: "Standard",
    prices: {
      "1": { usd: 39.99, eur: 36.99, gbp: 32.99 },
      "12": { usd: 31.99, eur: 29.59, gbp: 26.39 },
      "24": { usd: 27.99, eur: 25.89, gbp: 23.09 },
      "48": { usd: 23.99, eur: 22.19, gbp: 19.79 },
    },
  },
  pro: {
    name: "Pro",
    prices: {
      "1": { usd: 59.99, eur: 54.99, gbp: 49.99 },
      "12": { usd: 47.99, eur: 43.99, gbp: 39.99 },
      "24": { usd: 41.99, eur: 38.49, gbp: 34.99 },
      "48": { usd: 35.99, eur: 32.99, gbp: 29.99 },
    },
  },
  enterprise: {
    name: "Enterprise",
     prices: {
      "1": { usd: 149.99, eur: 139.99, gbp: 124.99 },
      "12": { usd: 119.99, eur: 111.99, gbp: 99.99 },
      "24": { usd: 104.99, eur: 97.99, gbp: 87.49 },
      "48": { usd: 89.99, eur: 83.99, gbp: 74.99 },
    },
  },
};

const currencySymbols: Record<Currency, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
};


function BillingPageContent() {
  const { currentUser, refreshCurrentUser } = useUser();
  const searchParams = useSearchParams();
  
  const [isCancelling, startCancellationTransition] = useTransition();
  const [isSessionLoading, startSessionLoadingTransition] = useTransition();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  // Get initial values from URL, with fallback for existing users
  const initialPlan = searchParams.get('plan') as Plan | undefined;
  const initialCurrency = (searchParams.get('currency') as Currency) || 'usd';
  const initialDuration = (searchParams.get('duration') as Duration) || '1';

  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [newPlan, setNewPlan] = useState<Plan | undefined>(initialPlan);
  const [duration, setDuration] = useState<Duration>(initialDuration);
  
  useEffect(() => {
    if (searchParams.get('payment_success') === 'true') {
        toast({
            title: "Payment Successful!",
            description: "Your subscription has been activated.",
        });
        refreshCurrentUser();
        // Clean the URL of query params
        window.history.replaceState(null, '', '/settings/billing');
    }
  // We only want this to run once on mount when the payment_success param is present
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetSession = useCallback(() => {
    if (!currentUser || !newPlan || newPlan === 'starter' || newPlan === 'custom') {
      toast({ variant: "destructive", title: "Cannot process payment", description: "Invalid user or plan selected." });
      return;
    }

    startSessionLoadingTransition(async () => {
      const result = await createCheckoutSession(
        currentUser.id,
        currentUser.email,
        newPlan as Exclude<Plan, 'starter' | 'custom'>,
        duration,
        currency
      );
      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret);
      } else {
        toast({ variant: "destructive", title: "Checkout Error", description: result.error || "Could not create checkout session." });
      }
    });
  }, [currentUser, newPlan, duration, currency]);

  if (!currentUser || !currentUser.plan) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleCancelConfirm = () => {
    if (!currentUser?.subscriptionId) {
      toast({ title: "Error", description: "No active subscription found to cancel." });
      return;
    }

    startCancellationTransition(async () => {
      const result = await cancelSubscription(currentUser.id, currentUser.subscriptionId!);
      if (result.success) {
        await refreshCurrentUser();
        toast({ title: "Subscription Cancellation Initiated", description: "Your subscription will be canceled at the end of the current billing period." });
      } else {
        toast({ variant: "destructive", title: "Cancellation Failed", description: result.error || "Could not cancel your subscription. Please try again." });
      }
    });
  };

  const planName = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1);
  const availablePlans = Object.keys(tiers).filter((p) => p !== currentUser?.plan) as (keyof typeof tiers)[];
  
  const isNewUserFlow = searchParams.has('new_user');
  const isStarterPlan = currentUser.plan === "starter";


  const endDate = currentUser.subscriptionEndsAt && isValid(new Date(currentUser.subscriptionEndsAt))
      ? format(new Date(currentUser.subscriptionEndsAt), "MMMM d, yyyy")
      : "N/A";

  const subscriptionText = () => {
    if (currentUser.subscriptionStatus === "canceled") {
      return `Your plan access ends on ${endDate}.`;
    }
    if (currentUser.plan !== "starter") {
      return `Your subscription renews on ${endDate}.`;
    }
    return null;
  };

  const selectedTier = newPlan && newPlan !== 'starter' && newPlan !== 'custom' ? tiers[newPlan] : null;
  const currentPrice = selectedTier ? selectedTier.prices[duration]?.[currency] ?? 0 : 0;
  const originalPrice = selectedTier ? selectedTier.prices["1"]?.[currency] ?? 0 : 0;
  const showDiscount = duration !== "1" && currentPrice < originalPrice;
  
  if (clientSecret) {
    return (
        <div className="bg-muted">
            <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
                 <div className="w-full max-w-2xl">
                    <div className="flex justify-center mb-8"><Link href="/dashboard"><Logo /></Link></div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Complete Your Payment</CardTitle>
                            <CardDescription>Enter your payment details below to start your subscription.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <EmbeddedCheckoutForm clientSecret={clientSecret} />
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-muted">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
        <div className="w-full max-w-2xl">
          <div className="flex justify-center mb-8">
            <Link href="/dashboard">
              <Logo />
            </Link>
          </div>

          <div>
            <h2 className="text-2xl font-bold mt-2 text-center">
              Plan & Billing
            </h2>
            <p className="text-muted-foreground text-center">
              You are currently on the{" "}
              <span className="font-semibold">{planName}</span> plan.{" "}
              {subscriptionText()}
            </p>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{isNewUserFlow || isStarterPlan ? "Select a Plan" : "Change Plan"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Select
                    value={newPlan}
                    onValueChange={(value) => setNewPlan(value as Plan)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a new plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlans.map((p) => (
                        <SelectItem
                          key={p}
                          value={p}
                          className="capitalize"
                        >
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={currency}
                    onValueChange={(value) => setCurrency(value as Currency)}
                  >
                    <SelectTrigger className="w-full">
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

                <div className="pt-2">
                    <Select
                      value={duration}
                      onValueChange={(value) => setDuration(value as Duration)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Month (No Discount)</SelectItem>
                        <SelectItem value="12">12 Months (20% off)</SelectItem>
                        <SelectItem value="24">24 Months (30% off)</SelectItem>
                        <SelectItem value="48">48 Months (40% off)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>
              
              {selectedTier && (
                <div className="flex justify-between items-center p-4 border rounded-lg bg-background">
                  <div>
                    <h3 className="font-semibold">{selectedTier.name} Plan</h3>
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
              )}

              <div className="flex gap-2 items-center">
                <Button
                  onClick={handleGetSession}
                  disabled={
                    !newPlan || newPlan === currentUser.plan || isSessionLoading
                  }
                >
                  {isSessionLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  {newPlan === currentUser.plan
                    ? "Current Plan"
                    : newPlan
                    ? `Update to ${tiers[newPlan as keyof typeof tiers]?.name}`
                    : "Select a Plan"}
                </Button>
              </div>

              {!isStarterPlan && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      Cancel Subscription
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      If you cancel, you will lose access to your plan's features at
                      the end of your billing period on {endDate}.
                    </p>
                    <CancelSubscriptionDialog
                      onConfirm={handleCancelConfirm}
                      disabled={isCancelling}
                    >
                      <Button
                        variant="destructive"
                        className="w-full sm:w-auto"
                        disabled={
                          currentUser.plan === "starter" ||
                          isCancelling ||
                          currentUser.subscriptionStatus === "canceled"
                        }
                      >
                        {isCancelling && (
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {currentUser.subscriptionStatus === "canceled"
                          ? "Cancellation Pending"
                          : "Cancel Subscription"}
                      </Button>
                    </CancelSubscriptionDialog>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground pt-8">
            <Link href="/settings/account" className="underline">
              Back to Account Management
            </Link>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AndonPro. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <BillingPageContent />
    </Suspense>
  );
}

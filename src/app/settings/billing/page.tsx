
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

type Duration = "1" | "12" | "24" | "48";

const tiers: Record<Exclude<Plan, "custom" | "starter">, any> = {
  standard: {
    name: "Standard",
  },
  pro: {
    name: "Pro",
  },
  enterprise: {
    name: "Enterprise",
  },
};

function BillingPageContent() {
  const { currentUser, refreshCurrentUser } = useUser();
  const searchParams = useSearchParams();
  
  const [isCancelling, startCancellationTransition] = useTransition();
  const [isSessionLoading, startSessionLoadingTransition] = useTransition();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  const [currency, setCurrency] = useState<Currency>((searchParams.get('currency') as Currency) || "usd");
  const [newPlan, setNewPlan] = useState<Plan | undefined>((searchParams.get('plan') as Plan) || undefined);
  const [duration, setDuration] = useState<Duration>((searchParams.get('duration') as Duration) || "1");
  
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
              <CardTitle>Change Plan</CardTitle>
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

                {isStarterPlan && (
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
                )}
              </div>

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

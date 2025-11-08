
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoaderCircle, Globe } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useState, useEffect, useTransition, Suspense } from "react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import type { Plan } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CancelSubscriptionDialog } from "@/components/settings/cancel-subscription-dialog";
import { Logo } from "@/components/layout/logo";
import { format, isValid } from "date-fns";
import { cancelSubscription } from "@/app/actions";

type Duration = '1' | '12' | '24' | '48';
type Currency = 'usd' | 'eur' | 'gbp';


const tiers: Record<Exclude<Plan, 'custom' | 'starter'>, any> = {
  standard: { 
    name: "Standard", 
    prices: { '1': { usd: 39.99, eur: 36.99, gbp: 32.99 }, '12': { usd: 31.99, eur: 29.59, gbp: 26.39 }, '24': { usd: 27.99, eur: 25.89, gbp: 23.09 }, '48': { usd: 23.99, eur: 22.19, gbp: 19.79 } },
    paymentLinks: {
        '1': { usd: 'https://buy.stripe.com/your_link_here', eur: 'https://buy.stripe.com/your_link_here', gbp: 'https://buy.stripe.com/your_link_here' },
        '12': { usd: 'https://buy.stripe.com/your_link_here', eur: 'https://buy.stripe.com/your_link_here', gbp: 'https://buy.stripe.com/your_link_here' },
        '24': { usd: 'https://buy.stripe.com/your_link_here', eur: 'https://buy.stripe.com/your_link_here', gbp: 'https://buy.stripe.com/your_link_here' },
        '48': { usd: 'https://buy.stripe.com/your_link_here', eur: 'https://buy.stripe.com/your_link_here', gbp: 'https://buy.stripe.com/your_link_here' },
    }
  },
  pro: { 
    name: "Pro", 
    prices: { '1': { usd: 59.99, eur: 54.99, gbp: 49.99 }, '12': { usd: 47.99, eur: 43.99, gbp: 39.99 }, '24': { usd: 41.99, eur: 38.49, gbp: 34.99 }, '48': { usd: 35.99, eur: 32.99, gbp: 29.99 } },
    paymentLinks: {
        '1': { usd: 'https://buy.stripe.com/your_link_here', eur: 'https://buy.stripe.com/your_link_here', gbp: 'https://buy.stripe.com/your_link_here' },
        '12': { usd: 'https://buy.stripe.com/your_link_here', eur: 'https://buy.stripe.com/your_link_here', gbp: 'https://buy.stripe.com/your_link_here' },
        '24': { usd: 'https://buy.stripe.com/your_link_here', eur: 'https://buy.stripe.com/your_link_here', gbp: 'https://buy.stripe.com/your_link_here' },
        '48': { usd: 'https://buy.stripe.com/your_link_here', eur: 'https://buy.stripe.com/your_link_here', gbp: 'https://buy.stripe.com/your_link_here' },
    }
  },
  enterprise: { 
    name: "Enterprise", 
    prices: { '1': { usd: 149.99, eur: 139.99, gbp: 124.99 }, '12': { usd: 119.99, eur: 111.99, gbp: 99.99 }, '24': { usd: 104.99, eur: 97.99, gbp: 87.49 }, '48': { usd: 89.99, eur: 83.99, gbp: 74.99 } },
    paymentLinks: {
        '1': { usd: 'https://buy.stripe.com/your_link_here', eur: 'https://buy.stripe.com/your_link_here', gbp: 'https://buy.stripe.com/your_link_here' },
        '12': { usd: 'https://buy.stripe.com/your_link_here', eur: 'https://buy.stripe.com/your_link_here', gbp: 'https://buy.stripe.com/your_link_here' },
        '24': { usd: 'https://buy.stripe.com/your_link_here', eur: 'https://buy.stripe.com/your_link_here', gbp: 'https://buy.stripe.com/your_link_here' },
        '48': { usd: 'https://buy.stripe.com/your_link_here', eur: 'https://buy.stripe.com/your_link_here', gbp: 'https://buy.stripe.com/your_link_here' },
    }
  },
};

const currencySymbols = { usd: '$', eur: '€', gbp: '£' };

const formatPrice = (price: number, currency: Currency) => {
    const locale = { usd: 'en-US', eur: 'de-DE', gbp: 'en-GB' }[currency];
    return price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


function BillingPageContent() {
    const { currentUser, refreshCurrentUser } = useUser();
    const [isCancelling, startCancellationTransition] = useTransition();

    const [currency, setCurrency] = useState<Currency>('usd');
    const [newPlan, setNewPlan] = useState<Plan | undefined>(currentUser?.plan);
    const [duration, setDuration] = useState<Duration>('12');
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

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
                toast({
                    title: "Subscription Cancellation Initiated",
                    description: "Your subscription will be canceled at the end of the current billing period.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Cancellation Failed",
                    description: result.error || "Could not cancel your subscription. Please try again.",
                });
            }
        });
    }

    const planName = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1);
    const availablePlans = Object.keys(tiers).filter(p => p !== currentUser?.plan) as (keyof typeof tiers)[];

    const selectedTier = newPlan && newPlan !== 'starter' && newPlan !== 'custom' ? tiers[newPlan] : null;
    const monthlyPrice = selectedTier ? selectedTier.prices[duration][currency] : 0;
    
    const endDate = currentUser.subscriptionEndsAt && isValid(new Date(currentUser.subscriptionEndsAt))
        ? format(new Date(currentUser.subscriptionEndsAt), "MMMM d, yyyy")
        : "N/A";
   
    const subscriptionText = () => {
        if (currentUser.subscriptionStatus === 'canceled') {
            return `Your plan access ends on ${endDate}.`;
        }
        if (currentUser.plan !== 'starter') {
            return `Your subscription renews on ${endDate}.`;
        }
        return null;
    };

    const paymentLink = selectedTier 
        ? `${selectedTier.paymentLinks[duration][currency]}?client_reference_id=${currentUser.orgId}&prefilled_email=${currentUser.email}`
        : "#";

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
                        <h2 className="text-2xl font-bold mt-2 text-center">Plan & Billing</h2>
                        <p className="text-muted-foreground text-center">
                            You are currently on the <span className="font-semibold">{planName}</span> plan. 
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
                                    <Select value={newPlan} onValueChange={(value) => setNewPlan(value as Plan)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a new plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availablePlans.map(p => (
                                                <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                     <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                                        <SelectTrigger className="w-full">
                                             <div className="flex items-center gap-2"><Globe className="h-4 w-4" /><SelectValue placeholder="Currency" /></div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="usd">USD</SelectItem>
                                            <SelectItem value="eur">EUR</SelectItem>
                                            <SelectItem value="gbp">GBP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="pt-2">
                                    <Select value={duration} onValueChange={(value) => setDuration(value as Duration)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 Month</SelectItem>
                                            <SelectItem value="12">12 Months</SelectItem>
                                            <SelectItem value="24">24 Months</SelectItem>
                                            <SelectItem value="48">48 Months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2 items-center pt-2">
                                    {duration === '12' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~20%</Badge>}
                                    {duration === '24' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~30%</Badge>}
                                    {duration === '48' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~40%</Badge>}
                                </div>
                                 <p className="text-sm text-muted-foreground">Plan changes will be billed based on selection.</p>
                            </div>

                             {selectedTier && newPlan !== currentUser.plan && (
                                 <div className="space-y-2 rounded-lg border bg-card-foreground/5 p-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center font-semibold text-lg">
                                            <span>New Monthly Price</span>
                                            <span>{currencySymbols[currency]}{formatPrice(monthlyPrice, currency)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex gap-2 items-center">
                                <Button asChild disabled={!newPlan || newPlan === currentUser.plan}>
                                    <Link href={paymentLink}>
                                        {newPlan === currentUser.plan ? 'Current Plan' : (newPlan ? `Update Plan` : 'Select a Plan')}
                                    </Link>
                                </Button>
                            </div>
                                <Separator />
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Cancel Subscription</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    If you cancel, you will lose access to your plan's features at the end of your billing period on {endDate}.
                                </p>
                                <CancelSubscriptionDialog onConfirm={handleCancelConfirm} disabled={isCancelling}>
                                    <Button variant="destructive" className="w-full sm:w-auto" disabled={currentUser.plan === 'starter' || isCancelling || currentUser.subscriptionStatus === 'canceled'}>
                                        {isCancelling && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        {currentUser.subscriptionStatus === 'canceled' ? 'Cancellation Pending' : 'Cancel Subscription'}
                                    </Button>
                                </CancelSubscriptionDialog>
                            </div>
                        </CardContent>
                    </Card>
                     <div className="text-center text-sm text-muted-foreground pt-8">
                        <Link href="/settings/account" className="underline">Back to Account Management</Link>
                    </div>
                </div>
                <footer className="mt-8 text-center text-sm text-muted-foreground">
                    © {year} AndonPro. All rights reserved.
                </footer>
            </div>
        </div>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        }>
            <BillingPageContent />
        </Suspense>
    )
}

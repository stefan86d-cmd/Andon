
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import type { Plan } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CancelSubscriptionDialog } from "@/components/settings/cancel-subscription-dialog";
import { Logo } from "@/components/layout/logo";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createCheckoutSession, getOrCreateStripeCustomer } from "@/app/actions";


const tiers: Record<Exclude<Plan, 'custom'>, { name: string; prices: Record<Duration, Record<Currency, number>> }> & { custom?: any } = {
  starter: { 
    name: "Starter", 
    prices: { '1': { usd: 0, eur: 0, gbp: 0 }, '12': { usd: 0, eur: 0, gbp: 0 }, '24': { usd: 0, eur: 0, gbp: 0 }, '48': { usd: 0, eur: 0, gbp: 0 } } 
  },
  standard: { 
    name: "Standard", 
    prices: { '1': { usd: 39.99, eur: 36.99, gbp: 32.99 }, '12': { usd: 31.99, eur: 29.99, gbp: 26.99 }, '24': { usd: 27.99, eur: 25.99, gbp: 22.99 }, '48': { usd: 23.99, eur: 21.99, gbp: 19.99 } }
  },
  pro: { 
    name: "Pro", 
    prices: { '1': { usd: 59.99, eur: 54.99, gbp: 49.99 }, '12': { usd: 47.99, eur: 43.99, gbp: 39.99 }, '24': { usd: 41.99, eur: 38.99, gbp: 34.99 }, '48': { usd: 35.99, eur: 32.99, gbp: 29.99 } }
  },
  enterprise: { 
    name: "Enterprise", 
    prices: { '1': { usd: 149.99, eur: 139.99, gbp: 124.99 }, '12': { usd: 119.99, eur: 111.99, gbp: 99.99 }, '24': { usd: 104.99, eur: 97.99, gbp: 87.99 }, '48': { usd: 89.99, eur: 83.99, gbp: 74.99 } }
  },
  custom: {
    name: "Custom",
    prices: { '1': { usd: 0, eur: 0, gbp: 0 }, '12': { usd: 0, eur: 0, gbp: 0 }, '24': { usd: 0, eur: 0, gbp: 0 }, '48': { usd: 0, eur: 0, gbp: 0 } }
  }
};

const currencySymbols = { usd: '$', eur: '€', gbp: '£' };
type Currency = 'usd' | 'eur' | 'gbp';
type Duration = '1' | '12' | '24' | '48';


const formatPrice = (price: number, currency: Currency) => {
    const locale = { usd: 'en-US', eur: 'de-DE', gbp: 'en-GB' }[currency];
    return price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


export default function BillingPage() {
    const { currentUser } = useUser();
    const router = useRouter();
    const [isSubmitting, startTransition] = useTransition();

    const [currency, setCurrency] = useState<Currency>('usd');
    const [newPlan, setNewPlan] = useState<Plan | undefined>(currentUser?.plan);
    const [duration, setDuration] = useState<Duration>('12');
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    if (!currentUser) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const isStarterPlan = currentUser.plan === 'starter';
    
    const handlePlanChange = () => {
        if (!newPlan) {
            toast({ title: "No Plan Selected", description: "Please choose a plan to continue." });
            return;
        }

        const selectedDuration = isStarterPlan ? duration : '1'; // Only allow duration change for starter plan upgrades
        
        startTransition(async () => {
            try {
                const customer = await getOrCreateStripeCustomer(currentUser.email);
                
                const priceIdMap: Record<Exclude<Plan, 'starter' | 'custom'>, Record<string, string | undefined>> = {
                    standard: {
                        '1': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD,
                        '12': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_12,
                        '24': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_24,
                        '48': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_48,
                    },
                    pro: {
                        '1': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
                        '12': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_12,
                        '24': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_24,
                        '48': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_48,
                    },
                    enterprise: {
                        '1': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE,
                        '12': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_12,
                        '24': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_24,
                        '48': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_48,
                    },
                };

                const priceId = priceIdMap[newPlan as Exclude<Plan, 'starter' | 'custom'>][selectedDuration];

                if (!priceId) {
                    throw new Error("Price ID not found for the selected plan and duration.");
                }

                const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
                const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/settings/billing`;
                const metadata = { userId: currentUser.id, plan: newPlan, duration: selectedDuration, isNewUser: String(isStarterPlan) };
                
                const result = await createCheckoutSession({
                    customerId: customer.id,
                    priceId,
                    duration: selectedDuration,
                    metadata,
                    successUrl,
                    cancelUrl
                });

                if (result.url) {
                    router.push(result.url);
                } else {
                    throw new Error("Could not create a checkout session.");
                }
            } catch (err: any) {
                toast({
                    variant: "destructive",
                    title: "Checkout Error",
                    description: err.message || "An unexpected error occurred. Please try again.",
                });
            }
        });
    }

    const handleCancelConfirm = () => {
        toast({
            title: "Subscription Cancelled (Mock)",
            description: "Your subscription would be cancelled at the end of the current period.",
        });
    }

    const planName = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1);
    const availablePlans = Object.keys(tiers).filter(p => p !== 'starter' && p !== 'custom') as Plan[];

    const selectedTier = newPlan ? tiers[newPlan] : null;
    const monthlyPrice = selectedTier ? selectedTier.prices[isStarterPlan ? duration : '1'][currency] : 0;
    
    const renewalDate = currentUser.subscriptionEndsAt 
        ? format(new Date(currentUser.subscriptionEndsAt), "MMMM d, yyyy")
        : "N/A";
   
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
                             {currentUser.plan !== 'starter' && ` Your subscription renews on ${renewalDate}.`}
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
                                    {isStarterPlan ? (
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
                                    ) : (
                                        <Select value={currency} onValueChange={(value) => setCurrency(value as any)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="usd">USD</SelectItem>
                                                <SelectItem value="eur">EUR</SelectItem>
                                                <SelectItem value="gbp">GBP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                                {isStarterPlan && (
                                     <div className="flex gap-2 items-center pt-2">
                                        {duration === '12' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~20%</Badge>}
                                        {duration === '24' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~30%</Badge>}
                                        {duration === '48' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~40%</Badge>}
                                     </div>
                                )}
                                 <p className="text-sm text-muted-foreground">Plan changes will be billed based on selection.</p>
                            </div>

                             {selectedTier && newPlan !== currentUser.plan && (
                                 <div className="space-y-2 rounded-lg border bg-card-foreground/5 p-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center font-bold text-lg">
                                            <span>New Monthly Price</span>
                                            <span>{currencySymbols[currency]}{formatPrice(monthlyPrice, currency)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            

                            <div className="flex gap-2 items-center">
                                <Button onClick={handlePlanChange} disabled={!newPlan || newPlan === currentUser.plan || isSubmitting}>
                                    {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    {newPlan === currentUser.plan ? 'Current Plan' : (newPlan ? `Go to Checkout` : 'Select a Plan')}
                                </Button>
                            </div>
                                <Separator />
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Cancel Subscription</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    If you cancel, you will lose access to your plan's features at the end of your billing period on {renewalDate}.
                                </p>
                                <CancelSubscriptionDialog onConfirm={handleCancelConfirm}>
                                    <Button variant="destructive" className="w-full sm:w-auto" disabled={currentUser.plan === 'starter'}>Cancel Subscription</Button>
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

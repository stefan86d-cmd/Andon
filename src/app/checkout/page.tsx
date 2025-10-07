
"use client";

import React, { Suspense, useState, useMemo, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/layout/logo";
import { LoaderCircle, Globe, Badge as BadgeIcon } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Plan } from '@/lib/types';
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/user-context';
import { toast } from '@/hooks/use-toast';
import { updateUserPlan } from '@/app/actions';

const tiers = {
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
};

const currencySymbols = { usd: '$', eur: '€', gbp: '£' };
type Currency = 'usd' | 'eur' | 'gbp';
type Duration = '1' | '12' | '24' | '48';

const formatPrice = (price: number, currency: Currency) => {
    const locale = { usd: 'en-US', eur: 'de-DE', gbp: 'en-GB' }[currency];
    return price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, updateCurrentUser } = useUser();
  const [isSubmitting, startTransition] = useTransition();

  const isExistingUser = !!currentUser;
  
  const [selectedPlan, setSelectedPlan] = useState<Plan>(searchParams.get('plan') as Plan || 'pro');
  const [selectedDuration, setSelectedDuration] = useState<Duration>(isExistingUser ? '1' : (searchParams.get('duration') as Duration || '12'));
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(searchParams.get('currency') as Currency || 'usd');

  const selectedTier = tiers[selectedPlan];
  const monthlyPrice = selectedTier.prices[isExistingUser ? '1' : selectedDuration][selectedCurrency];
  const fullPrice = selectedTier.prices['1'][selectedCurrency];
  const totalDue = monthlyPrice * parseInt(isExistingUser ? '1' : selectedDuration, 10);
  const undiscountedTotal = fullPrice * parseInt(isExistingUser ? '1' : selectedDuration, 10);


  const discount = useMemo(() => {
    if (isExistingUser || selectedDuration === '1') return 0;
    return undiscountedTotal - totalDue;
  }, [selectedDuration, undiscountedTotal, totalDue, isExistingUser]);

  const renewalText = useMemo(() => {
      if (selectedPlan === 'starter') return "The Starter plan is always free.";
      const symbol = currencySymbols[selectedCurrency];
      const price = formatPrice(fullPrice, selectedCurrency);
      return `Renews at ${symbol}${price}/mo. Cancel anytime.`;
  }, [fullPrice, selectedCurrency, selectedPlan]);

  const handleContinue = () => {
    if (currentUser) {
        startTransition(async () => {
            if (selectedPlan === currentUser.plan) {
                toast({ title: "No Change", description: "You are already on this plan." });
                router.push('/settings/billing');
                return;
            }
            const result = await updateUserPlan(currentUser.id, selectedPlan);
            if (result.success) {
                toast({
                    title: "Plan Updated!",
                    description: `Your plan has been successfully updated to ${selectedPlan}.`,
                });
                updateCurrentUser({ plan: selectedPlan });
                router.push('/dashboard');
            } else {
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: "error" in result ? result.error : "Could not update your plan.",
                });
            }
        });
    } else {
        router.push(`/register?plan=${selectedPlan}&duration=${selectedDuration}&currency=${selectedCurrency}`);
    }
  };

  const buttonText = currentUser ? "Confirm Plan Change" : "Continue";

  return (
    <div className="bg-muted">
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl">
                {/* Left Side: Plan Selection */}
                <div className="flex flex-col gap-8">
                <div className="flex justify-start">
                    <Link href={currentUser ? "/dashboard" : "/"}>
                    <Logo />
                    </Link>
                </div>
                <div>
                    <h2 className="text-2xl font-bold mt-2">Checkout</h2>
                    <p className="text-muted-foreground">
                    {currentUser ? "Review your new plan details below." : "Review your plan and continue to create your account."}
                    </p>
                </div>
                <Card>
                    <CardHeader>
                    <CardTitle>Selected Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Select value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as Plan)}>
                        <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                        <SelectContent>
                            {Object.keys(tiers).map(key => <SelectItem key={key} value={key} className="capitalize">{tiers[key as Plan].name}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <Select value={selectedDuration} onValueChange={(v) => setSelectedDuration(v as Duration)} disabled={isExistingUser}>
                        <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 Month</SelectItem>
                            <SelectItem value="12">12 Months</SelectItem>
                            <SelectItem value="24">24 Months</SelectItem>
                            <SelectItem value="48">48 Months</SelectItem>
                        </SelectContent>
                        </Select>
                        <Select value={selectedCurrency} onValueChange={(v) => setSelectedCurrency(v as Currency)}>
                        <SelectTrigger className="w-[120px]">
                            <div className="flex items-center gap-2"><Globe className="h-4 w-4" /><SelectValue placeholder="Currency" /></div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="usd">USD</SelectItem>
                            <SelectItem value="eur">EUR</SelectItem>
                            <SelectItem value="gbp">GBP</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    {!isExistingUser && (
                        <div className="flex gap-2 items-center">
                            {selectedDuration === '12' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~20%</Badge>}
                            {selectedDuration === '24' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~30%</Badge>}
                            {selectedDuration === '48' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~40%</Badge>}
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">{renewalText}</p>
                    </CardContent>
                </Card>
                </div>

                {/* Right Side: Order Summary */}
                <div className="flex flex-col gap-8 pt-0 lg:pt-16">
                <Card className="w-full">
                    <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>Plan</span><span className="capitalize font-medium">{selectedPlan}</span></div>
                        <div className="flex justify-between"><span>Plan Length</span><span>{isExistingUser ? '1 Month' : `${selectedDuration} Months`}</span></div>
                        {discount > 0 && 
                            <div className="flex justify-between bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 p-2 rounded-md">
                                <span>Discount</span>
                                <span>-{currencySymbols[selectedCurrency]}{formatPrice(discount, selectedCurrency)}</span>
                            </div>
                        }
                    </div>
                    <Separator />
                    <div className="space-y-1 text-right">
                            {discount > 0 && (
                                <p className="text-muted-foreground line-through">
                                    {currencySymbols[selectedCurrency]}{formatPrice(undiscountedTotal, selectedCurrency)}
                                </p>
                            )}
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>Subtotal</span>
                                <span>{currencySymbols[selectedCurrency]}{formatPrice(totalDue, selectedCurrency)}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                    <Button onClick={handleContinue} className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        {buttonText}
                    </Button>
                    </CardFooter>
                </Card>
                </div>
            </div>
            <footer className="mt-8 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} AndonPro. All rights reserved.
            </footer>
        </div>
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
            <CheckoutContent />
        </Suspense>
    )
}

    
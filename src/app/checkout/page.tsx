
"use client";

import React, { Suspense, useState, useMemo, useTransition, useEffect } from 'react';
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
import { LoaderCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Plan } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/user-context';
import { toast } from '@/hooks/use-toast';
import { createCheckoutSession, getOrCreateStripeCustomer } from '@/app/actions';
import { EmbeddedCheckoutForm } from '@/components/checkout/embedded-checkout-form';
import { Skeleton } from '@/components/ui/skeleton';

const currencySymbols = { usd: '$', eur: '€', gbp: '£' };
type Currency = 'usd' | 'eur' | 'gbp';
type Duration = '1' | '12' | '24' | '48';


const formatPrice = (price: number, currency: Currency) => {
    const locale = { usd: 'en-US', eur: 'de-DE', gbp: 'en-GB' }[currency];
    return price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


const tiers: Record<Exclude<Plan, 'custom' | 'starter'>, { name: string; prices: Record<Duration, Record<Currency, number>> }> = {
  standard: { 
    name: "Standard", 
    prices: { '1': { usd: 39.99, eur: 36.99, gbp: 32.99 }, '12': { usd: 31.99, eur: 29.59, gbp: 26.39 }, '24': { usd: 27.99, eur: 25.89, gbp: 23.09 }, '48': { usd: 23.99, eur: 22.19, gbp: 19.79 } }
  },
  pro: { 
    name: "Pro", 
    prices: { '1': { usd: 59.99, eur: 54.99, gbp: 49.99 }, '12': { usd: 47.99, eur: 43.99, gbp: 39.99 }, '24': { usd: 41.99, eur: 38.49, gbp: 34.99 }, '48': { usd: 35.99, eur: 32.99, gbp: 29.99 } }
  },
  enterprise: { 
    name: "Enterprise", 
    prices: { '1': { usd: 149.99, eur: 139.99, gbp: 124.99 }, '12': { usd: 119.99, eur: 111.99, gbp: 99.99 }, '24': { usd: 104.99, eur: 97.99, gbp: 87.49 }, '48': { usd: 89.99, eur: 83.99, gbp: 74.99 } }
  },
};


function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useUser();
  const [isSubmitting, startTransition] = useTransition();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const plan = (searchParams.get('plan') as Plan) || 'pro';
  const duration = (searchParams.get('duration') as Duration) || '12';
  const currency = (searchParams.get('currency') as Currency) || 'usd';

  const handleSelectionChange = (type: 'plan' | 'duration' | 'currency', value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(type, value);
    router.push(`/checkout?${newParams.toString()}`, { scroll: false });
  };
  
  const isNewUser = !currentUser;

  const handleContinue = () => {
     if (plan === 'starter') {
      router.push(`/register?plan=starter`);
      return;
    }
    
    startTransition(async () => {
      if (!currentUser) {
          router.push(`/register?plan=${plan}&duration=${duration}&currency=${currency}`);
          return;
      }
      
      try {
        if (!currentUser.email) throw new Error("User email not available.");

        const customer = await getOrCreateStripeCustomer(currentUser.id, currentUser.email);
        
        const metadata = { userId: currentUser.id, plan: plan, duration: duration, isNewUser: 'false' };
        
        const result = await createCheckoutSession({
            customerId: customer.id,
            plan: plan,
            duration: duration,
            currency: currency,
            metadata,
        });

        if (result.clientSecret) {
            setClientSecret(result.clientSecret);
        } else {
            throw new Error("Could not create a checkout session.");
        }
      } catch (err: any) {
         toast({
              variant: "destructive",
              title: "Checkout Error",
              description: err.message || "Could not create a checkout session. Please try again.",
          });
      }
    });
  };

  const buttonText = isNewUser ? "Continue to Sign Up" : "Proceed to Payment";
  
  if (clientSecret) {
    return (
       <div className="bg-muted min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg">
                 <div className="flex justify-center mb-8">
                    <Logo />
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Complete Your Payment</CardTitle>
                        <CardDescription>Enter your payment details below to complete the subscription.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EmbeddedCheckoutForm clientSecret={clientSecret} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
  }

  const OrderSummary = () => {
      if (plan === 'starter' || !tiers[plan as keyof typeof tiers]) {
           return (
              <div className="space-y-4">
                <div className="flex justify-between"><span>Plan</span><span className="capitalize font-medium">Starter</span></div>
                <Separator />
                <div className="flex justify-between items-baseline font-bold text-lg">
                    <span>Price</span>
                    <span>Free</span>
                </div>
            </div>
          )
      }
      
      const selectedTier = tiers[plan as keyof typeof tiers];
      const monthlyPrice = selectedTier.prices[duration][currency];
      const fullPrice = selectedTier.prices['1'][currency];
      const totalFullPrice = fullPrice * parseInt(duration, 10);
      const totalDiscountedPrice = monthlyPrice * parseInt(duration, 10);
      const discount = totalFullPrice - totalDiscountedPrice;


      return (
           <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between"><span>Plan</span><span className="capitalize font-medium">{plan}</span></div>
                    <div className="flex justify-between"><span>Price per month</span><span>{currencySymbols[currency]}{formatPrice(monthlyPrice, currency)}</span></div>
                     {plan !== 'starter' && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Regular price</span>
                            <span>{currencySymbols[currency]}{formatPrice(fullPrice, currency)} / mo</span>
                        </div>
                    )}
                     {discount > 0 && (
                        <div className="flex justify-between bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 p-2 rounded-md">
                        <span>Discount ({duration} months)</span>
                        <span>-{currencySymbols[currency]}{formatPrice(discount, currency)}</span>
                        </div>
                    )}
                </div>
                <Separator />
                <div className="space-y-1">
                    <div className="flex justify-between items-baseline font-bold text-lg">
                        <span>Price Today</span>
                        <span>{currencySymbols[currency]}{formatPrice(monthlyPrice, currency)}</span>
                    </div>
                     <p className="text-xs text-muted-foreground text-right mt-1">
                       + taxes. Billed monthly. Renews at {currencySymbols[currency]}{formatPrice(fullPrice, currency)}/mo after the first {duration} months.
                    </p>
                </div>
            </div>
      )
  }
  
    const renewalText = useMemo(() => {
        if (plan === 'starter' || !tiers[plan as keyof typeof tiers]) return "The Starter plan is always free.";
        
        const selectedTier = tiers[plan as keyof typeof tiers];
        const monthlyPrice = selectedTier.prices[duration][currency];
        const fullPrice = selectedTier.prices['1'][currency];
        
        const symbol = currencySymbols[currency];
        const price = formatPrice(fullPrice, currency);
        const savingsText =
        parseInt(duration) > 1
            ? `That's only ${symbol}${formatPrice(monthlyPrice, currency)}/mo.`
            : "";
        return `Billed monthly. Discount applies for the first ${duration} months. ${savingsText} Renews at ${symbol}${price}/mo. Cancel anytime.`;
    }, [plan, duration, currency]);

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
                                <Select value={plan} onValueChange={(v) => handleSelectionChange('plan', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                                    <SelectContent>
                                    {Object.entries(tiers).map(([key, tier]) =>
                                        tier.name !== 'Custom' && tier.name !== 'Starter' && (
                                        <SelectItem key={key} value={key} className="capitalize">{tier.name}</SelectItem>
                                        )
                                    )}
                                    </SelectContent>
                                </Select>

                                <Select value={duration} onValueChange={(v) => handleSelectionChange('duration', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                                    <SelectContent>
                                    <SelectItem value="1">1 Month</SelectItem>
                                    <SelectItem value="12">12 Months</SelectItem>
                                    <SelectItem value="24">24 Months</SelectItem>
                                    <SelectItem value="48">48 Months</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={currency} onValueChange={(v) => handleSelectionChange('currency', v)}>
                                    <SelectTrigger className="w-[120px]">
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
                            
                            <div>
                                <div className="flex gap-2 items-center">
                                    {duration === '12' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~20%</Badge>}
                                    {duration === '24' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~30%</Badge>}
                                    {duration === '48' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~40%</Badge>}
                                </div>
                            </div>
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
                        <CardContent>
                            <OrderSummary />
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
                © {year} AndonPro. All rights reserved.
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

    
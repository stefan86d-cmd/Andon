
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
import { createCheckoutSession, getOrCreateStripeCustomer, getPriceDetails } from '@/app/actions';
import { EmbeddedCheckoutForm } from '@/components/checkout/embedded-checkout-form';
import { Skeleton } from '@/components/ui/skeleton';

const currencySymbols = { usd: '$', eur: '€', gbp: '£' };
type Currency = 'usd' | 'eur' | 'gbp';

const formatPrice = (price: number, currency: Currency) => {
    const locale = { usd: 'en-US', eur: 'de-DE', gbp: 'en-GB' }[currency];
    return price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface PriceDetails {
    price: number;
    currency: Currency;
    plan: Plan;
    duration: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useUser();
  const [isSubmitting, startTransition] = useTransition();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [priceDetails, setPriceDetails] = useState<PriceDetails | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  const priceId = searchParams.get('priceId');

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  
  useEffect(() => {
    if (!priceId) {
        toast({ title: "Missing Price", description: "No price was selected. Please go back to the pricing page.", variant: "destructive" });
        setIsLoadingPrice(false);
        return;
    }
    
    setIsLoadingPrice(true);
    getPriceDetails(priceId).then(details => {
        if (details) {
            setPriceDetails(details as PriceDetails);
        } else {
            toast({ title: "Invalid Price", description: "The selected price is not valid. Please go back and try again.", variant: "destructive" });
        }
        setIsLoadingPrice(false);
    });

  }, [priceId]);

  const isNewUser = !currentUser;

  const handleContinue = () => {
    if (!priceId) {
        toast({ title: "Error", description: "No price selected.", variant: "destructive"});
        return;
    }

    startTransition(async () => {
      if (!currentUser) {
          router.push(`/register?priceId=${priceId}`);
          return;
      }
      
      try {
        if (!currentUser.email) throw new Error("User email not available.");

        const customer = await getOrCreateStripeCustomer(currentUser.id, currentUser.email);
        
        const metadata = { userId: currentUser.id, plan: priceDetails?.plan || '', duration: priceDetails?.duration || '' };
        
        const result = await createCheckoutSession({
            customerId: customer.id,
            priceId: priceId,
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
      if (isLoadingPrice || !priceDetails) {
          return (
              <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                  <Separator />
                  <Skeleton className="h-8 w-1/2 ml-auto" />
              </div>
          )
      }

      const { price, currency, plan, duration } = priceDetails;
      const currencySymbol = currencySymbols[currency];

      return (
           <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between"><span>Plan</span><span className="capitalize font-medium">{plan}</span></div>
                    <div className="flex justify-between"><span>Duration</span><span>{duration} Months</span></div>
                </div>
                <Separator />
                <div className="space-y-1">
                    <div className="flex justify-between items-baseline font-bold text-lg">
                        <span>Price per Month</span>
                        <span>{currencySymbol}{formatPrice(price, currency)}</span>
                    </div>
                     <p className="text-xs text-muted-foreground text-right mt-1">
                       + applicable taxes
                    </p>
                </div>
            </div>
      )
  }

  return (
    <div className="bg-muted">
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-4xl">
                {/* Left Side: Plan Review */}
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
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrderSummary />
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleContinue} className="w-full" disabled={isSubmitting || isLoadingPrice || !priceId}>
                                {(isSubmitting || isLoadingPrice) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {buttonText}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                 {/* Right Side: Spacer/Empty or some other content */}
                <div className="hidden lg:flex flex-col gap-8 pt-0 lg:pt-16 items-center justify-center">
                    <p className="text-muted-foreground italic">Thank you for choosing AndonPro.</p>
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

    


"use client";

import React, { Suspense, useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/logo";
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from '@/lib/countries';
import type { Plan, Role } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/user-context';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { sendWelcomeEmail, createPaymentIntent } from '@/app/actions';
import { addMonths } from 'date-fns';


const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  address: z.string().min(1, "Address is required."),
  city: z.string().min(1, "City is required."),
  postalCode: z.string().min(1, "Postal code is required."),
  country: z.string().min(1, "Country is required."),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type Duration = '1' | '12' | '24' | '48';
type Currency = 'usd' | 'eur' | 'gbp';


const tiers: Record<Plan, { name: string; prices: Record<Duration, Record<Currency, number>> }> = {
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


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');


function CheckoutForm({ onSuccessfulPayment, clientSecret }: { onSuccessfulPayment: () => void, clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const form = useFormContext<ProfileFormValues>();

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // First, validate the profile form
        const isProfileValid = await form.trigger();
        if (!isProfileValid) {
            toast({
                title: "Incomplete Profile",
                description: "Please fill out all required profile fields before proceeding.",
                variant: "destructive"
            });
            return;
        }

        // Then, proceed with payment
        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard?payment_success=true`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message || "An unexpected error occurred.");
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            setErrorMessage(null);
            onSuccessfulPayment();
        } else {
             setIsProcessing(false);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleFormSubmit}>
            <PaymentElement id="payment-element" />
            <Button disabled={isProcessing || !stripe || !elements} id="submit" className="w-full mt-6">
                <span id="button-text">
                    {isProcessing ? <LoaderCircle className="animate-spin" /> : "Complete Registration"}
                </span>
            </Button>
            {errorMessage && <div id="payment-message" className="text-destructive mt-2 text-sm">{errorMessage}</div>}
        </form>
    );
}


function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, loading: userLoading, updateCurrentUser } = useUser();
  
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const planFromUrl = searchParams.get('plan') as Plan | null;
  const durationFromUrl = searchParams.get('duration') as Duration | null;
  const currencyFromUrl = searchParams.get('currency') as Currency | null;
  
  const selectedPlan = planFromUrl || 'starter';
  const selectedDuration = durationFromUrl || '1';
  const selectedCurrency = currencyFromUrl || 'usd';

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "", lastName: "", address: "", city: "", postalCode: "", country: "", phone: "",
    },
  });
  
  useEffect(() => {
    if (!userLoading && !currentUser) {
      toast({ title: "Not Authenticated", description: "You must be signed in to complete your profile.", variant: "destructive" });
      router.push('/register');
    }
    if (currentUser) {
        form.reset({
            firstName: currentUser.firstName || "",
            lastName: currentUser.lastName || "",
            address: currentUser.address || "",
            city: "",
            postalCode: "",
            country: currentUser.country || "",
            phone: currentUser.phone || ""
        });

        if (selectedPlan !== 'starter' && !clientSecret) {
            const tier = tiers[selectedPlan as Exclude<Plan, 'custom'>];
            if (tier) {
                const amount = tier.prices[selectedDuration][selectedCurrency];
                
                createPaymentIntent(amount, selectedCurrency).then(res => {
                    if (res.clientSecret) {
                        setClientSecret(res.clientSecret);
                    } else {
                        toast({
                            title: "Payment Error",
                            description: res.error || "Could not initialize payment. Please try again.",
                            variant: "destructive"
                        });
                        router.push('/pricing');
                    }
                });
            }
        }
    }
  }, [currentUser, userLoading, router, form, selectedPlan, selectedDuration, selectedCurrency, clientSecret]);
  
  const handleProfileSave = async (data: ProfileFormValues) => {
    if (!currentUser || !currentUser.id) {
        toast({ title: "Authentication Error", description: "Your session has expired. Please sign in again.", variant: "destructive" });
        return false;
    }

    try {
        const userRole: Role = "admin"; // First user is always an admin
        
        const now = new Date();
        const subscriptionEndDate = selectedPlan === 'starter' 
            ? undefined 
            : addMonths(now, parseInt(selectedDuration, 10));

        const userProfileData: any = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: currentUser.email,
            role: userRole,
            plan: selectedPlan,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country,
            phone: data.phone,
            orgId: currentUser.id, // The first admin's ID becomes the org ID
        };
        
        if (selectedPlan !== 'starter') {
            userProfileData.subscriptionStartsAt = now;
            userProfileData.subscriptionEndsAt = subscriptionEndDate;
        }


        await updateCurrentUser(userProfileData);

        // Send welcome email after profile is saved
        await sendWelcomeEmail(currentUser.id);

        return true;
    } catch (error) {
        console.error("Failed to save profile:", error);
        toast({ title: "Profile Creation Failed", description: "Could not save your profile. Please try again.", variant: "destructive" });
        return false;
    }
  };


  const onSuccessfulPayment = async () => {
    const profileData = form.getValues();
    const profileSaved = await handleProfileSave(profileData);
    
    if (profileSaved) {
        toast({
            title: "Registration Complete!",
            description: `Welcome to the ${selectedPlan} plan. Your account is ready!`,
        });
        router.push('/dashboard');
    }
  };

  const handleFreePlanSubmit = () => {
      startTransition(async () => {
        const isValid = await form.trigger();
        if (isValid) {
            const profileData = form.getValues();
            const profileSaved = await handleProfileSave(profileData);
            if (profileSaved) {
                toast({
                    title: "Registration Complete!",
                    description: `Welcome to the ${selectedPlan} plan. Your account is ready!`,
                });
                router.push('/dashboard');
            }
        }
    });
  };


  if (userLoading || !currentUser || (selectedPlan !== 'starter' && !clientSecret)) {
    if (selectedPlan === 'starter' && currentUser) {
        // Continue to render the form for the starter plan
    } else {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        );
    }
  }

  return (
    <div className="bg-muted">
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
            <div className="w-full max-w-lg">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Logo />
                    </Link>
                </div>
                
                <Card>
                    <CardHeader className="text-center">
                      <h2 className="text-2xl font-bold">Complete Your Profile</h2>
                      <p className="text-muted-foreground">
                        Just a few more details to get you started.
                      </p>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                        <form id="profile-form" className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="postalCode" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Postal Code</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="country" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {countries.map(country => <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="phone" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Phone Number (Optional)</FormLabel>
                                    <FormControl><Input type="tel" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                             {selectedPlan !== 'starter' && clientSecret && (
                                <div>
                                    <Label className="mb-2 block">Payment Information</Label>
                                    <Elements options={{ clientSecret }} stripe={stripePromise}>
                                        <CheckoutForm onSuccessfulPayment={onSuccessfulPayment} clientSecret={clientSecret} />
                                    </Elements>
                                </div>
                            )}
                        </form>
                        </Form>
                    </CardContent>
                     {selectedPlan === 'starter' && (
                        <CardFooter className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground text-center">
                                By clicking the button below, you agree to our <Link href="/terms" className="underline" target="_blank" rel="noopener noreferrer">Terms of Service</Link>.
                            </p>
                            <Button onClick={handleFreePlanSubmit} className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Complete Registration
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>
            <footer className="mt-8 text-center text-sm text-muted-foreground">
                © {year} AndonPro. All rights reserved.
            </footer>
        </div>
    </div>
  );
}


export default function CompleteProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        }>
            <CompleteProfileContent />
        </Suspense>
    )
}

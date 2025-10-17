
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
import { sendWelcomeEmail } from '@/app/actions';
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


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');


function CheckoutForm({ onSuccessfulPayment, clientSecret }: { onSuccessfulPayment: () => void, clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // This is where the user will be redirected after payment.
                return_url: `${window.location.origin}/dashboard`,
            },
            redirect: 'if_required', // Important to handle success without redirecting immediately
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setErrorMessage(error.message || "An unexpected error occurred.");
            } else {
                setErrorMessage("An unexpected error occurred.");
            }
            setIsProcessing(false);
        } else {
            // Payment succeeded!
            setErrorMessage(null);
            onSuccessfulPayment();
        }
    };
    
    const form = useFormContext();

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = await form.trigger();
        if (isValid) {
            await handleSubmit(e);
        }
    }

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

  const planFromUrl = searchParams.get('plan') as Plan | null;
  const durationFromUrl = searchParams.get('duration') as Duration | null;
  const selectedPlan = planFromUrl || 'starter';
  const selectedDuration = durationFromUrl || '1';

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

        // Don't create a checkout session for free plans
        if (selectedPlan !== 'starter' && !clientSecret) {
            // This is where you would call your backend to create a payment intent
            // For now, we'll assume it's handled elsewhere or mocked
        }
    }
  }, [currentUser, userLoading, router, form, selectedPlan, clientSecret]);
  
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

        const userProfileData = {
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
            subscriptionStartsAt: selectedPlan !== 'starter' ? now : undefined,
            subscriptionEndsAt: subscriptionEndDate,
        };

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
    // If the plan is 'starter', we don't need a clientSecret, so don't show the loader
    if (userLoading || !currentUser || (selectedPlan !== 'starter' && !clientSecret)) {
       if (selectedPlan === 'starter' && currentUser) {
            // Render the form for the starter plan without waiting for a client secret
       } else {
            return (
                <div className="flex h-screen items-center justify-center">
                    <LoaderCircle className="h-8 w-8 animate-spin" />
                </div>
            );
       }
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
                © {new Date().getFullYear()} AndonPro. All rights reserved.
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

    
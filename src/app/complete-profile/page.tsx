
"use client";

import React, { Suspense, useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
import { Logo } from "@/components/layout/logo";
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from '@/lib/countries';
import type { Plan, Role } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/user-context';
import { createCheckoutSession, sendWelcomeEmail, getOrCreateStripeCustomer } from '@/app/actions';
import { EmbeddedCheckoutForm } from '@/components/checkout/embedded-checkout-form';


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


function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, loading: userLoading, updateCurrentUser } = useUser();
  
  const [isSubmitting, startTransition] = useTransition();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  const plan = (searchParams.get('plan') as Plan) || 'starter';
  const duration = searchParams.get('duration') || '1';
  const currency = searchParams.get('currency') || 'usd';
  const isStarterPlan = plan === 'starter';


  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  
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
    }
  }, [currentUser, userLoading, router, form]);
  
  const handleProfileSave = async (data: ProfileFormValues) => {
    if (!currentUser || !currentUser.id) {
        toast({ title: "Authentication Error", description: "Your session has expired. Please sign in again.", variant: "destructive" });
        return false;
    }

    try {
        const userRole: Role = "admin"; // First user is always an admin
        
        const userProfileData = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: currentUser.email,
            role: userRole,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country,
            phone: data.phone,
            orgId: currentUser.id, // The first admin's ID becomes the org ID
            plan: plan,
        };
        
        await updateCurrentUser(userProfileData);

        return true;
    } catch (error) {
        console.error("Failed to save profile:", error);
        toast({ title: "Profile Update Failed", description: "Could not save your profile. Please try again.", variant: "destructive" });
        return false;
    }
  };

  const handleSubmit = () => {
      startTransition(async () => {
        const isProfileValid = await form.trigger();
        if (!isProfileValid) {
            toast({
                title: "Incomplete Profile",
                description: "Please fill out all required profile fields before proceeding.",
                variant: "destructive"
            });
            return;
        }

        const profileData = form.getValues();
        const profileSaved = await handleProfileSave(profileData);
        
        if (!profileSaved || !currentUser) return;

        if (isStarterPlan) {
            await updateCurrentUser({ subscriptionStartsAt: new Date() });
            await sendWelcomeEmail(currentUser.id);
            toast({
                title: "Registration Complete!",
                description: `Welcome to the Starter plan. Your account is ready!`,
            });
            router.push('/dashboard');
        } else {
           try {
                if (!currentUser?.email) throw new Error("User email is not available.");
                
                const customer = await getOrCreateStripeCustomer(currentUser.id, currentUser.email);
                const metadata = { userId: currentUser.id, plan: plan, duration: duration, isNewUser: 'true' };

                const result = await createCheckoutSession({
                    customerId: customer.id,
                    plan,
                    duration,
                    currency,
                    metadata,
                    returnPath: '/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}',
                });

                if (result.clientSecret) {
                    setClientSecret(result.clientSecret);
                } else {
                    throw new Error("Could not create a checkout session.");
                }
            } catch(err: any) {
                 toast({
                    variant: "destructive",
                    title: "Checkout Error",
                    description: err.message || "Could not create a checkout session. Please try again.",
                });
            }
        }
    });
  };

  if (userLoading || !currentUser) {
    return (
        <div className="flex h-screen items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
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
                        <CardDescription>Enter your payment details to start your subscription.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EmbeddedCheckoutForm key={clientSecret} clientSecret={clientSecret} />
                    </CardContent>
                </Card>
            </div>
        </div>
      )
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
                        <form id="profile-form" className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
                        </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground text-center">
                            By clicking the button below, you agree to our <Link href="/terms" className="underline" target="_blank" rel="noopener noreferrer">Terms of Service</Link>.
                        </p>
                        <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {isStarterPlan ? 'Complete Registration' : 'Continue to Payment'}
                        </Button>
                    </CardFooter>
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

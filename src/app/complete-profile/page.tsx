
"use client";

import React, { Suspense, useState, useEffect } from 'react';
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
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/logo";
import { LoaderCircle, CreditCard, Calendar, Lock, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from '@/lib/countries';
import type { Plan } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/user-context';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';


const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  address: z.string().min(1, "Home address is required."),
  city: z.string().min(1, "City is required."),
  postalCode: z.string().min(1, "Postal code is required."),
  country: z.string().min(1, "Country is required."),
  phone: z.string().optional(),
  // Mock credit card fields - now optional
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvc: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


const MockStripeInput = () => {
    return (
        <div className="border rounded-md p-3 bg-muted/50">
            <div className="flex justify-between items-center mb-3">
                <Label htmlFor="card-number" className="text-sm">Card information</Label>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
                <div className="relative">
                    <Input id="card-number" placeholder="Card Number" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                       <Input id="expiry-date" placeholder="MM/YY" />
                    </div>
                    <div className="relative">
                       <Input id="cvc" placeholder="CVC" />
                    </div>
                </div>
            </div>
        </div>
    )
}


function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, loading: userLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "", lastName: "", address: "", city: "", postalCode: "", country: "", phone: "",
      cardNumber: "", expiryDate: "", cvc: ""
    },
  });
  
  useEffect(() => {
    if (!userLoading && !currentUser) {
      toast({ title: "Not Authenticated", description: "You must be signed in to complete your profile.", variant: "destructive" });
      router.push('/register');
    }
  }, [currentUser, userLoading, router]);

  const selectedPlan = searchParams.get('plan') as Plan || 'starter';

  const handleCreateAccount = async (data: ProfileFormValues) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "Your session has expired. Please sign in again.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    // This is a mock payment action
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
        // Save user profile data to Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, {
            firstName: data.firstName,
            lastName: data.lastName,
            email: currentUser.email,
            role: "admin", // First user is always an admin
            plan: selectedPlan,
            address: data.address,
            country: data.country,
            phone: data.phone,
        }, { merge: true });

        toast({
            title: "Order & Pay Success!",
            description: `Welcome to the ${selectedPlan} plan. Your account is ready!`,
        });

        router.push('/dashboard');

    } catch (error) {
        console.error("Failed to save profile:", error);
        toast({ title: "Profile Creation Failed", description: "Could not save your profile. Please try again.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  if (userLoading || !currentUser) {
    return (
        <div className="flex h-screen items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
    );
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
                        <form id="profile-form" onSubmit={form.handleSubmit(handleCreateAccount)} className="space-y-6">
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
                                <FormLabel>Home Address</FormLabel>
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
                             <div>
                                <MockStripeInput />
                            </div>
                        </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                         <p className="text-sm text-muted-foreground text-center">
                            By clicking the button below, you agree to our <Link href="/terms" className="underline" target="_blank" rel="noopener noreferrer">Terms of Service</Link>.
                        </p>
                        <Button type="submit" form="profile-form" className="w-full" disabled={isLoading}>
                            {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Order and Pay
                        </Button>
                    </CardFooter>
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

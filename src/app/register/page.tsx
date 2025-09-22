
"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/layout/logo";
import { useUser } from '@/contexts/user-context';
import { toast } from '@/hooks/use-toast';
import { LoaderCircle, CreditCard, Calendar, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const tiers: any = {
  starter: { name: "Starter", price: 0 },
  standard: { name: "Standard", price: 31 },
  pro: { name: "Pro", price: 47 },
  enterprise: { name: "Enterprise", price: 119 },
};

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, loading: userLoading, login } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const plan = searchParams.get('plan') || 'standard';
  const duration = searchParams.get('duration') || '12';
  const currency = searchParams.get('currency') || 'usd';

  const selectedTier = tiers[plan];

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // In a real app, you would register the user, process payment, etc.
    setTimeout(() => {
      toast({
        title: "Registration Successful!",
        description: `Welcome to the ${selectedTier.name} plan.`,
      });
      // For this mock, we'll just log the user in with a mock account and redirect
      login('alex.j@andon.io').then(() => {
        router.push('/dashboard');
      });
    }, 2000);
  };
  
  const handlePayment = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
     setTimeout(() => {
      toast({
        title: "Payment Successful!",
        description: `Your subscription to the ${selectedTier.name} plan has been confirmed.`,
      });
      router.push('/dashboard');
    }, 2000);
  }

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
            {/* Left Side: Plan and User Details */}
            <div className="flex flex-col gap-8">
                <div className="flex justify-start">
                    <Link href="/">
                        <Logo />
                    </Link>
                </div>
                <div>
                  <Badge variant="secondary">You're signing up for</Badge>
                  <h1 className="text-4xl font-bold mt-2">{selectedTier.name} Plan</h1>
                  <p className="text-muted-foreground mt-2">
                      Complete your registration to get started with AndonPro.
                  </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {currentUser ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Name</span>
                                    <span className="font-medium">{currentUser.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Email</span>
                                    <span className="font-medium">{currentUser.email}</span>
                                </div>
                                 <div className="text-center pt-4">
                                    <p className="text-sm text-muted-foreground">Not you? <button onClick={() => { localStorage.removeItem('currentUserEmail'); window.location.reload(); }} className="text-primary hover:underline">Log out</button></p>
                                </div>
                            </div>
                        ) : (
                             <form id="registration-form" onSubmit={handleRegistration} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="john.d@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Side: Payment Form */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                    <CardDescription>
                        {currentUser ? 'Confirm your subscription.' : 'Enter your payment details to complete registration.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="payment-form" onSubmit={handlePayment} className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <div className="relative">
                                <Input id="cardNumber" placeholder="0000 0000 0000 0000" required />
                                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="expiryDate">Expires</Label>
                                <div className="relative">
                                    <Input id="expiryDate" placeholder="MM / YY" required />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="cvc">CVC</Label>
                                 <div className="relative">
                                    <Input id="cvc" placeholder="123" required />
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input id="cardName" placeholder="John Doe" required />
                        </div>

                        <Separator className="my-4" />

                        <div className="flex justify-between items-center font-medium">
                            <span>{selectedTier.name} Plan ({duration} months)</span>
                            <span>{currency.toUpperCase()} ${selectedTier.price * Number(duration)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            By clicking "Confirm Payment", you agree to our Terms of Service.
                        </p>

                        <Button type="submit" form={currentUser ? 'payment-form' : 'registration-form'} className="w-full" disabled={isLoading}>
                            {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {currentUser ? "Confirm Payment" : "Create Account & Pay"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}


export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    )
}


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
  CardFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tiers: any = {
  starter: { name: "Starter", prices: { '1': 0, '12': 0, '24': 0, '48': 0 } },
  standard: { name: "Standard", prices: { '1': 39.99, '12': 31.99, '24': 27.99, '48': 23.99 } },
  pro: { name: "Pro", prices: { '1': 59.99, '12': 47.99, '24': 41.99, '48': 35.99 } },
  enterprise: { name: "Enterprise", prices: { '1': 149.99, '12': 119.99, '24': 104.99, '48': 89.99 } },
};

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, loading: userLoading, login } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'standard');
  const [selectedDuration, setSelectedDuration] = useState(searchParams.get('duration') || '12');
  
  const selectedTier = tiers[selectedPlan];
  const isFreePlan = selectedPlan === 'starter';
  const price = selectedTier.prices[selectedDuration];
  const originalPrice = selectedTier.prices['1'];
  const discountPercent = selectedDuration !== '1' ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const totalSaved = (originalPrice - price) * parseInt(selectedDuration);


  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // In a real app, you would register the user.
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
       login('alex.j@andon.io').then(() => {
        router.push('/dashboard');
      });
    }, 2000);
  }

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const formAction = isFreePlan ? handleRegistration : (currentUser ? handlePayment : handleRegistration);
  const mainFormId = isFreePlan ? 'registration-form' : (currentUser ? 'payment-form' : 'registration-form');


  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl">
            {/* Left Side: Plan and User Details */}
            <div className="flex flex-col gap-8">
                <div className="flex justify-start">
                    <Link href="/">
                        <Logo />
                    </Link>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mt-2">Create your Account</h1>
                  <p className="text-muted-foreground mt-2">
                      Complete your registration to get started with AndonPro.
                  </p>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Selected Plan</CardTitle>
                        <Link href="/pricing" className="text-sm font-medium text-primary hover:underline">
                            Explore plans
                        </Link>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Plan</Label>
                            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(tiers).map(key => (
                                        <SelectItem key={key} value={key}>{tiers[key].name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Billing Duration</Label>
                            <Select value={selectedDuration} onValueChange={setSelectedDuration} disabled={isFreePlan}>
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
                    </CardContent>
                </Card>

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
                             <form id="registration-form" onSubmit={formAction} className="space-y-4">
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

            {/* Right Side: Payment Form or Summary */}
            <div className="flex flex-col justify-center">
                {isFreePlan ? (
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                            <CardDescription>You are signing up for the free Starter plan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex justify-between items-center font-medium text-lg">
                                <span>Starter Plan</span>
                                <span>$0.00</span>
                            </div>
                             <p className="text-sm text-muted-foreground mt-4">
                                By clicking "Create Account", you agree to our Terms of Service.
                            </p>
                            <Button type="submit" form="registration-form" className="w-full mt-6" disabled={isLoading}>
                                {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex flex-col gap-8">
                      <Card className="w-full">
                          <CardHeader>
                              <CardTitle>Order Summary</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">{selectedTier.name} Plan</span>
                                  <span className="font-semibold text-lg">
                                      ${(price).toFixed(2)}
                                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                                  </span>
                              </div>
                               {discountPercent > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">Original price</span>
                                  <span className="text-muted-foreground line-through">${originalPrice.toFixed(2)}/mo</span>
                                </div>
                              )}
                              {totalSaved > 0 && (
                                  <div className="flex justify-between items-center text-sm p-2 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                      <span className="font-medium">Save {discountPercent}%</span>
                                      <span className="font-bold">-${totalSaved.toFixed(2)}</span>
                                  </div>
                              )}
                              <Separator />
                              <div className="flex justify-between items-center font-bold text-lg">
                                  <span>Total due today</span>
                                  <span>${(price * parseInt(selectedDuration)).toFixed(2)}</span>
                              </div>
                          </CardContent>
                      </Card>

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
                                              <Lock className="absolute right-3 top-1.2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                          </div>
                                      </div>
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="cardName">Name on Card</Label>
                                      <Input id="cardName" placeholder="John Doe" required />
                                  </div>
                                   <p className="text-sm text-muted-foreground pt-2">
                                      By clicking the button below, you agree to our Terms of Service.
                                  </p>
                              </form>
                          </CardContent>
                           <CardFooter>
                               <Button type="submit" form={mainFormId} className="w-full" disabled={isLoading}>
                                  {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                  {currentUser ? "Confirm Payment" : "Create Account & Pay"}
                              </Button>
                          </CardFooter>
                      </Card>
                    </div>
                )}
            </div>
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

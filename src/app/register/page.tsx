
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
import { LoaderCircle, CreditCard, Calendar, Lock, Globe } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tiers: any = {
  starter: { 
    name: "Starter", 
    prices: {
        '1': { usd: 0, eur: 0 }, '12': { usd: 0, eur: 0 }, '24': { usd: 0, eur: 0 }, '48': { usd: 0, eur: 0 }
    } 
  },
  standard: { 
    name: "Standard", 
    prices: {
        '1': { usd: 39.99, eur: 36.99 }, '12': { usd: 31.99, eur: 29.99 }, '24': { usd: 27.99, eur: 25.99 }, '48': { usd: 23.99, eur: 21.99 }
    }
  },
  pro: { 
    name: "Pro", 
    prices: {
        '1': { usd: 59.99, eur: 54.99 }, '12': { usd: 47.99, eur: 43.99 }, '24': { usd: 41.99, eur: 38.99 }, '48': { usd: 35.99, eur: 32.99 }
    }
  },
  enterprise: { 
    name: "Enterprise", 
    prices: {
        '1': { usd: 149.99, eur: 139.99 }, '12': { usd: 119.99, eur: 111.99 }, '24': { usd: 104.99, eur: 97.99 }, '48': { usd: 89.99, eur: 83.99 }
    }
  },
};

const currencySymbols = {
    usd: '$',
    eur: '€',
};

const formatPrice = (price: number, currency: 'usd' | 'eur') => {
    const locale = currency === 'eur' ? 'de-DE' : 'en-US';
    return price.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};


function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5 mr-2">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.816 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
    return (
        <svg viewBox="0 0 21 21" className="h-5 w-5 mr-2">
            <path fill="#f25022" d="M1 1h9v9H1z" />
            <path fill="#00a4ef" d="M1 11h9v9H1z" />
            <path fill="#7fba00" d="M11 1h9v9h-9z" />
            <path fill="#ffb900" d="M11 11h9v9h-9z" />
        </svg>
    )
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, login } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'standard');
  const [selectedDuration, setSelectedDuration] = useState(searchParams.get('duration') || '12');
  const [selectedCurrency, setSelectedCurrency] = useState<'usd' | 'eur'>(searchParams.get('currency') as 'usd' | 'eur' || 'usd');
  
  const selectedTier = tiers[selectedPlan];
  const isFreePlan = selectedPlan === 'starter';
  const price = selectedTier.prices[selectedDuration][selectedCurrency];
  const originalPrice = selectedTier.prices['1'][selectedCurrency];
  const discountPercent = selectedDuration !== '1' && originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const totalSaved = (originalPrice - price) * parseInt(selectedDuration);
  const currencySymbol = currencySymbols[selectedCurrency];

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
  
  const formAction = isFreePlan ? handleRegistration : (currentUser ? handlePayment : handleRegistration);
  const mainFormId = isFreePlan ? 'registration-form' : (currentUser ? 'payment-form' : 'registration-form');


  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl">
            {/* Left Side: Registration / Payment */}
            <div className="flex flex-col gap-8">
                <div className="flex justify-start">
                    <Link href="/">
                        <Logo />
                    </Link>
                </div>
                
                 <div>
                  <h2 className="text-2xl font-bold mt-2">Your Details</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" disabled>
                        <GoogleIcon />
                        Sign up with Google
                    </Button>
                    <Button variant="outline" disabled>
                        <MicrosoftIcon />
                        Sign up with Microsoft
                    </Button>
                </div>

                <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background px-2 text-xs text-muted-foreground">OR</span>
                </div>
                
                <form id={mainFormId} onSubmit={formAction} className="space-y-6">
                    {currentUser ? (
                         <div className="space-y-4 rounded-lg border bg-card-foreground/5 p-6">
                            <h3 className="font-semibold">Logged in as:</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Name</span>
                                <span className="font-medium">{currentUser.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Email</span>
                                <span className="font-medium">{currentUser.email}</span>
                            </div>
                                <div className="text-center pt-2">
                                <p className="text-sm text-muted-foreground">Not you? <button onClick={() => { localStorage.removeItem('currentUserEmail'); window.location.reload(); }} className="text-primary hover:underline">Log out</button></p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
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
                        </div>
                    )}

                    {!isFreePlan && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                                {currentUser && (
                                     <CardDescription>
                                        The remaining value of your current plan will be credited towards this upgrade.
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                            </CardContent>
                        </Card>
                    )}
                     <p className="text-sm text-muted-foreground pt-2">
                        By clicking the button below, you agree to our <Link href="#" className="underline">Terms of Service</Link>.
                    </p>
                    <Button type="submit" form={mainFormId} className="w-full" disabled={isLoading}>
                        {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        {isFreePlan ? "Create Account" : (currentUser ? "Confirm Payment" : "Create Account & Pay")}
                    </Button>
                </form>

            </div>

            {/* Right Side: Order Summary */}
            <div className="flex flex-col gap-8 pt-0 lg:pt-16">
                 <Card className="w-full">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Order Summary</CardTitle>
                         <Link href="/pricing" className="text-sm font-medium text-primary hover:underline">
                            Explore plans
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Plan</Label>
                                 <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(tiers).map(key => (
                                            <SelectItem key={key} value={key}>{tiers[key].name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-between items-center">
                                <Label>Billing Duration</Label>
                                <Select value={selectedDuration} onValueChange={setSelectedDuration} disabled={isFreePlan}>
                                    <SelectTrigger className="w-[180px]">
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
                             <div className="flex justify-between items-center">
                                <Label>Currency</Label>
                                <Select value={selectedCurrency} onValueChange={(v) => setSelectedCurrency(v as any)} disabled={isFreePlan}>
                                    <SelectTrigger className="w-[180px]">
                                         <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Select currency" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="usd">USD ($)</SelectItem>
                                       <SelectItem value="eur">EUR (€)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Separator/>
                        {isFreePlan ? (
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>Total due today</span>
                                <span>{currencySymbol}0.00</span>
                            </div>
                        ): (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">{selectedTier.name} Plan</span>
                                    <span className="font-semibold text-lg">
                                        {currencySymbol}{formatPrice(price, selectedCurrency)}
                                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                                    </span>
                                </div>
                                {discountPercent > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Original price</span>
                                    <span className="text-muted-foreground line-through">{currencySymbol}{formatPrice(originalPrice, selectedCurrency)}/mo</span>
                                    </div>
                                )}
                                {totalSaved > 0 && (
                                    <div className="flex justify-between items-center text-sm p-2 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                        <span className="font-medium">Save {discountPercent}%</span>
                                        <span className="font-bold">-{currencySymbol}{formatPrice(totalSaved, selectedCurrency)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between items-center font-bold text-lg">
                                    <span>Total due today</span>
                                    <span>{currencySymbol}{(formatPrice(price * parseInt(selectedDuration), selectedCurrency))}</span>
                                </div>
                            </div>
                        )}
                        
                    </CardContent>
                </Card>
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


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
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addUser } from '@/app/actions';
import { countries } from '@/lib/countries';

const registerFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
  address: z.string().min(1, "Home address is required."),
  country: z.string().min(1, "Country is required."),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

const tiers: any = {
  starter: { 
    name: "Starter", 
    prices: {
        '1': { usd: 0, eur: 0, gbp: 0 }, 
        '12': { usd: 0, eur: 0, gbp: 0 }, 
        '24': { usd: 0, eur: 0, gbp: 0 }, 
        '48': { usd: 0, eur: 0, gbp: 0 }
    } 
  },
  standard: { 
    name: "Standard", 
    prices: {
        '1': { usd: 39.99, eur: 36.99, gbp: 32.99 }, 
        '12': { usd: 31.99, eur: 29.99, gbp: 26.99 }, 
        '24': { usd: 27.99, eur: 25.99, gbp: 22.99 }, 
        '48': { usd: 23.99, eur: 21.99, gbp: 19.99 }
    }
  },
  pro: { 
    name: "Pro", 
    prices: {
        '1': { usd: 59.99, eur: 54.99, gbp: 49.99 }, 
        '12': { usd: 47.99, eur: 43.99, gbp: 39.99 }, 
        '24': { usd: 41.99, eur: 38.99, gbp: 34.99 }, 
        '48': { usd: 35.99, eur: 32.99, gbp: 29.99 }
    }
  },
  enterprise: { 
    name: "Enterprise", 
    prices: {
        '1': { usd: 149.99, eur: 139.99, gbp: 124.99 }, 
        '12': { usd: 119.99, eur: 111.99, gbp: 99.99 }, 
        '24': { usd: 104.99, eur: 97.99, gbp: 87.99 }, 
        '48': { usd: 89.99, eur: 83.99, gbp: 74.99 }
    }
  },
};

const currencySymbols = {
    usd: '$',
    eur: '€',
    gbp: '£',
};

type Currency = 'usd' | 'eur' | 'gbp';

const formatPrice = (price: number, currency: Currency) => {
    const locale = {
        usd: 'en-US',
        eur: 'de-DE',
        gbp: 'en-GB'
    }[currency];
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
  const { currentUser, login, signInWithGoogle, signInWithMicrosoft } = useUser();
  const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      address: "",
      country: "",
      phone: "",
    },
  });

  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'standard');
  const [selectedDuration, setSelectedDuration] = useState(searchParams.get('duration') || '12');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(searchParams.get('currency') as Currency || 'usd');
  
  const selectedTier = tiers[selectedPlan];
  const isFreePlan = selectedPlan === 'starter';
  const price = selectedTier.prices[selectedDuration][selectedCurrency];
  const originalPrice = selectedTier.prices['1'][selectedCurrency];
  const discountPercent = selectedDuration !== '1' && originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const totalSaved = (originalPrice - price) * parseInt(selectedDuration);
  const currencySymbol = currencySymbols[selectedCurrency];

  const handleRegistration = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // Step 1: Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Step 2: Add user to Firestore via server action
      const result = await addUser({
        uid: user.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: 'admin', // The first user to register is an admin
        plan: selectedPlan as any,
        address: data.address,
        country: data.country,
        phone: data.phone,
      });

      if (result.success) {
        toast({
          title: "Registration Successful!",
          description: `Welcome to the ${selectedTier.name} plan. Logging you in...`,
        });
        // Step 3: Login the new user and redirect
        await login(data.email, data.password);
        router.push('/dashboard');
      } else {
        // TODO: Handle Firestore user creation failure (e.g., delete auth user)
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: result.error || "Could not save user details to database.",
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      // Handle Firebase Auth errors
      let description = "An unexpected error occurred.";
      if (error.code) {
        switch(error.code) {
            case 'auth/email-already-in-use':
                description = 'This email address is already in use.';
                break;
            case 'auth/invalid-email':
                description = 'Please enter a valid email address.';
                break;
             case 'auth/weak-password':
                description = 'The password is too weak. Please choose a stronger password.';
                break;
            default:
                description = error.message;
        }
     }
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: description,
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
        await signInWithGoogle(selectedPlan as any);
        toast({
            title: "Registration Successful",
            description: `Welcome! You're signed up with Google for the ${selectedTier.name} plan.`,
        });
        router.push('/dashboard');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Google Sign-Up Failed",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        setIsGoogleLoading(false);
    }
  }

  const handleMicrosoftSignIn = async () => {
    setIsMicrosoftLoading(true);
    try {
        await signInWithMicrosoft(selectedPlan as any);
        toast({
            title: "Registration Successful",
            description: `Welcome! You're signed up with Microsoft for the ${selectedTier.name} plan.`,
        });
        router.push('/dashboard');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Microsoft Sign-Up Failed",
            description: error.message || "An unexpected error occurred during Microsoft sign-up.",
        });
    } finally {
        setIsMicrosoftLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl">
            {/* Left Side: Registration */}
            <div className="flex flex-col gap-8">
                <div className="flex justify-start">
                    <Link href="/">
                        <Logo />
                    </Link>
                </div>
                
                 <div>
                  <h2 className="text-2xl font-bold mt-2">Create your account</h2>
                   <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Log in
                    </Link>
                </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading || isMicrosoftLoading}>
                        {isGoogleLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                        Sign up with Google
                    </Button>
                    <Button variant="outline" onClick={handleMicrosoftSignIn} disabled={isLoading || isGoogleLoading || isMicrosoftLoading}>
                        {isMicrosoftLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <MicrosoftIcon />}
                        Sign up with Microsoft
                    </Button>
                </div>

                <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background px-2 text-xs text-muted-foreground">OR</span>
                </div>
                
                <Form {...form}>
                <form id="registration-form" onSubmit={form.handleSubmit(handleRegistration)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John" {...field} disabled={isLoading || isGoogleLoading || isMicrosoftLoading} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} disabled={isLoading || isGoogleLoading || isMicrosoftLoading} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                         <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Home Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="123 Main St" {...field} disabled={isLoading || isGoogleLoading || isMicrosoftLoading} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a country" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {countries.map(country => (
                                                <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Phone Number (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="tel" {...field} disabled={isLoading || isGoogleLoading || isMicrosoftLoading} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="john.d@example.com" {...field} disabled={isLoading || isGoogleLoading || isMicrosoftLoading} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} disabled={isLoading || isGoogleLoading || isMicrosoftLoading} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Repeat Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} disabled={isLoading || isGoogleLoading || isMicrosoftLoading} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                     <p className="text-sm text-muted-foreground pt-2">
                        By clicking the button below, you agree to our <Link href="#" className="underline">Terms of Service</Link>.
                    </p>
                    <Button type="submit" form="registration-form" className="w-full" disabled={isLoading || isGoogleLoading || isMicrosoftLoading}>
                        {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                </form>
                </Form>

            </div>

            {/* Right Side: Order Summary */}
            <div className="flex flex-col gap-8 pt-0 lg:pt-16">
                 <Card className="w-full">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Order Summary</CardTitle>
                         <Link href="/pricing" className="text-sm font-medium text-primary hover:underline">
                            Change plan
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
                                       <SelectItem value="gbp">GBP (£)</SelectItem>
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

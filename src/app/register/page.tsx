
"use client";

import React, { Suspense, useState, useTransition, useEffect } from 'react';
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
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/layout/logo";
import { useUser } from '@/contexts/user-context';
import { toast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';

const registerFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

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

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerWithEmail, signInWithGoogle } = useUser();

  const [isLoading, startEmailRegisterTransition] = useTransition();
  const [isGoogleLoading, startGoogleRegisterTransition] = useTransition();
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const plan = searchParams.get('plan') || 'starter';
  const duration = searchParams.get('duration') || '12';
  const currency = searchParams.get('currency') || 'usd';
  
  const getRedirectUrl = () => `/complete-profile?plan=${plan}&duration=${duration}&currency=${currency}`;

  const handleRegistration = (data: RegisterFormValues) => {
    startEmailRegisterTransition(async () => {
        const success = await registerWithEmail(data.email, data.password);
        if (success) {
            router.push(getRedirectUrl());
        }
    });
  };
  
  const handleGoogleSignIn = () => {
    startGoogleRegisterTransition(async () => {
        const success = await signInWithGoogle();
        if (success) {
            router.push(getRedirectUrl());
        }
    });
  }

  const isAnyLoading = isLoading || isGoogleLoading;

  return (
    <div className="bg-muted">
        <div className="flex min-h-screen flex-col items-center justify-center">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center p-6">
                        <Logo />
                    </div>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                        Sign up to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 mb-4">
                        <Button variant="outline" onClick={handleGoogleSignIn} disabled={isAnyLoading}>
                            {isGoogleLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                            Sign up with Google
                        </Button>
                    </div>

                    <div className="relative my-4">
                        <Separator />
                        <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">OR</span>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleRegistration)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} disabled={isAnyLoading} />
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
                                            <Input type="password" {...field} disabled={isAnyLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isAnyLoading}>
                                {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Register
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline">
                            Log in
                        </Link>
                    </div>
                </CardContent>
            </Card>
            <footer className="mt-8 text-center text-sm text-muted-foreground">
                © {year} AndonPro. All rights reserved.
            </footer>
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

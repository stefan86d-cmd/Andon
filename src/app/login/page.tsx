
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
import { Logo } from "@/components/layout/logo";
import { useUser } from '@/contexts/user-context';
import { toast } from '@/hooks/use-toast';
import { LoaderCircle, Database } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5">
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, startLoginTransition] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const router = useRouter();
  const { loading, login, signInWithGoogle, signInWithMicrosoft } = useUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    startLoginTransition(async () => {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Login Successful",
          description: `Welcome back! Redirecting...`,
        });
        router.push('/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid email or password.",
        });
      }
    });
  };
  
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const success = await signInWithGoogle();
    if (success) {
        toast({
            title: "Login Successful",
            description: "Welcome! You're signed in with Google.",
        });
        router.push('/dashboard');
    }
    setIsGoogleLoading(false);
  }

  const handleMicrosoftSignIn = async () => {
    setIsMicrosoftLoading(true);
    await signInWithMicrosoft();
     toast({
        title: "Login Successful",
        description: "Welcome! You're signed in with Microsoft.",
    });
    setIsMicrosoftLoading(false);
  };

  return (
    <div className="bg-muted">
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader className="space-y-1">
                        <div className="flex justify-center p-6">
                            <Logo />
                        </div>
                        <CardTitle>Login to AndonPro</CardTitle>
                        <CardDescription>
                            Enter your credentials to continue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin}>
                            <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoggingIn || isGoogleLoading || isMicrosoftLoading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password" 
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoggingIn || isGoogleLoading || isMicrosoftLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoggingIn || isGoogleLoading || isMicrosoftLoading}>
                                {isLoggingIn && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Login
                            </Button>
                            </div>
                        </form>
                        
                        <div className="mt-4 text-center text-sm">
                            <Link href="/forgot-password" passHref>
                            <span className="underline cursor-pointer">
                                Forgot password?
                            </span>
                            </Link>
                        </div>

                        <div className="relative my-4">
                            <Separator />
                            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">OR</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoggingIn || isGoogleLoading || isMicrosoftLoading}>
                                {isGoogleLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                                Sign in with Google
                            </Button>
                            <Button variant="outline" className="w-full" onClick={handleMicrosoftSignIn} disabled={isLoggingIn || isGoogleLoading || isMicrosoftLoading}>
                                {isMicrosoftLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <MicrosoftIcon />}
                                Sign in with Microsoft
                            </Button>
                        </div>
                            
                        <div className="mt-4 text-center text-sm">
                            Don't have an account?{' '}
                            <Link href="/pricing" passHref>
                                <span className="underline cursor-pointer">
                                    Sign up
                                </span>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <footer className="mt-8 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} AndonPro. All rights reserved.
            </footer>
        </div>
    </div>
  );
}

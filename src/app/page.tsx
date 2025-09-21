
"use client";

import React, { useState, useTransition } from 'react';
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
import { auth, googleProvider, signInWithPopup } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { seedUsers, addUser } from './actions';
import { getUserByEmail } from '@/lib/data';
import type { Role } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, startSeedingTransition] = useTransition();
  const router = useRouter();
  const { currentUser, loading } = useUser();

  const postLoginFlow = async (email: string, name: string) => {
      const user = await getUserByEmail(email);
      if (!user) {
        throw new Error("User profile not found in the database. Please try seeding the users again.");
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });

      if (user.role === 'operator') {
        router.replace('/line-status');
      } else {
        router.replace('/dashboard');
      }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.email || !userCredential.user.displayName) {
        throw new Error("Email not found for the logged-in user.");
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await postLoginFlow(userCredential.user.email, userCredential.user.displayName);

    } catch (error: any) {
      console.error("Login Error:", error);
      let errorMessage = "An unknown error occurred.";
       if (error.message.includes("User profile not found")) {
        errorMessage = "User profile not found. Please click 'Seed Default Users' and try again."
      } else {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          default:
            errorMessage = 'Failed to log in. Please try again.';
            break;
        }
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        if (!user.email || !user.displayName) {
            throw new Error("Could not retrieve user information from Google.");
        }

        // Check if user exists in our Firestore DB
        let dbUser = await getUserByEmail(user.email);

        if (!dbUser) {
            // User does not exist, create a new one
            const [firstName, ...lastNameParts] = user.displayName.split(' ');
            const lastName = lastNameParts.join(' ') || ' ';

            await addUser({
                uid: user.uid,
                email: user.email,
                firstName: firstName,
                lastName: lastName,
                role: 'operator' as Role, // Default role for new sign-ups
            });
             // Add a delay to allow Firestore to be consistent
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await postLoginFlow(user.email, user.displayName);

    } catch (error: any) {
        console.error("Google Sign-In Error:", error);
        toast({
            variant: "destructive",
            title: "Sign-in Failed",
            description: error.message || "Failed to sign in with Google. Please try again.",
        });
        setIsLoading(false);
    }
  }


  const handleSeed = () => {
    startSeedingTransition(async () => {
        const result = await seedUsers();
        if (result.success) {
            toast({
                title: "Database Seeded",
                description: result.message + " You can now log in with default users.",
            });
        } else {
             toast({
                variant: "destructive",
                title: "Seeding Failed",
                description: result.error,
            });
        }
    });
  }
  
  // If user is already logged in, redirect them.
  if (!loading && currentUser) {
    if (currentUser.role === 'operator') {
      router.replace('/line-status');
    } else {
      router.replace('/dashboard');
    }
    return (
        <div className="flex h-screen items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
            <p className="ml-2">Redirecting...</p>
        </div>
    );
  }

  // Show a loading spinner while checking auth state on initial load
  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="space-y-1">
          <div className="flex justify-center p-6">
            <Logo />
          </div>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials or sign in with Google.
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
                  placeholder="alex.j@andon.io"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                    id="password" 
                    type="password"
                    placeholder="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || isSeeding}>
                  {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  Login with Email
              </Button>
            </div>
          </form>
          <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background px-2 text-xs text-muted-foreground">OR</span>
          </div>
           <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isSeeding}>
              {isLoading ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Sign in with Google
            </Button>
           {process.env.NODE_ENV === 'development' && (
             <div className="mt-4 border-t pt-4">
                <p className="text-sm text-muted-foreground text-center mb-2">First time? Seed the database with default users.</p>
                <Button variant="outline" className="w-full" onClick={handleSeed} disabled={isSeeding || isLoading}>
                    {isSeeding ? (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Database className="mr-2 h-4 w-4" />
                    )}
                    Seed Default Users
                </Button>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}

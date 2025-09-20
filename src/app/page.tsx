
"use client";

import React, { useState } from 'react';
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
import { allUsers } from '@/lib/data';
import { toast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser, currentUser } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // This is a mock authentication flow. In a real Firebase app,
    // you would use signInWithEmailAndPassword. We are simulating it
    // for now until Firestore is fully integrated.
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      // For this mock, we'll just check if a password is provided.
      // A real app would validate the password hash.
      if (password) {
        setUser(user.role);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        });
        if (user.role === 'operator') {
          router.push('/line-status');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Please enter your password.",
        });
        setIsLoading(false);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "No user found with that email.",
      });
      setIsLoading(false);
    }
  };
  
  // If user is already logged in, redirect them.
  if (currentUser) {
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
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="space-y-1">
          <div className="flex justify-center p-6">
            <Logo />
          </div>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
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
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

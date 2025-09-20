
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = email.toLowerCase();
    if (emailLower === 'admin') {
      setUser('admin');
      router.push('/dashboard');
    } else if (emailLower === 'supervisor') {
        setUser('supervisor');
        router.push('/dashboard');
    } else {
      setUser('operator');
      router.push('/line-status');
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="space-y-1">
          <div className="flex justify-center p-6">
            <Logo />
          </div>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account. (Hint: try 'Admin', 'Supervisor', or 'Operator')
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" />
              </div>
              <Button type="submit" className="w-full">
                  Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import React, { useState, useTransition, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Logo } from "@/components/layout/logo";
import { LoaderCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { getClientInstances } from '@/firebase/client';
import { sendPasswordChangedEmail } from '@/app/actions';

const formSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, startTransition] = useTransition();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const oobCode = searchParams.get('oobCode');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Verify the reset code and get the user's email
  React.useEffect(() => {
    if (oobCode) {
      const { app } = getClientInstances();
      const auth = getAuth(app);
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setUserEmail(email);
        })
        .catch(() => {
          toast({ title: "Invalid Link", description: "This password reset link is invalid or has expired.", variant: "destructive" });
        });
    }
  }, [oobCode]);


  const onSubmit = (data: FormValues) => {
    if (!oobCode || !userEmail) {
        toast({ title: "Error", description: "Invalid or missing reset token.", variant: "destructive" });
        return;
    }

    startTransition(async () => {
      try {
        const { app } = getClientInstances();
        const auth = getAuth(app); // Use client-side auth
        
        await confirmPasswordReset(auth, oobCode, data.newPassword);

        // Send confirmation email
        await sendPasswordChangedEmail(userEmail);
        
        toast({
          title: "Password Reset Successful",
          description: "You can now log in with your new password.",
        });
        router.push('/login');
        
      } catch (err: any) {
        let errorMessage = "An unexpected error occurred.";
        if (err.code === 'auth/invalid-action-code') {
            errorMessage = "This password reset link is invalid or has expired. Please request a new one.";
        }
        toast({
          title: "Password Reset Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
  };

  if (!oobCode || !userEmail) {
     return (
       <Card className="mx-auto max-w-sm w-full">
         <CardHeader>
           <CardTitle>Invalid Link</CardTitle>
           <CardDescription>This password reset link is invalid or has expired.</CardDescription>
         </CardHeader>
         <CardContent>
           <Link href="/forgot-password">
             <Button className="w-full">Request a new link</Button>
           </Link>
         </CardContent>
       </Card>
     )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
        <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center p-6">
            <Logo />
            </div>
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>
            Enter a new password for your account: {userEmail}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                        <Input
                        type="password"
                        {...field}
                        />
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
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                        <Input
                        type="password"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
                </Button>
            </form>
            </Form>
            <div className="mt-4 text-center text-sm">
                <Link href="/login" className="underline">
                Back to login
                </Link>
            </div>
        </CardContent>
        </Card>
    </div>
  );
}


export default function ResetPasswordPage() {
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);
    return (
        <div className="bg-muted">
            <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
                 <Suspense fallback={
                    <div className="flex items-center justify-center">
                        <LoaderCircle className="h-8 w-8 animate-spin" />
                    </div>
                }>
                    <ResetPasswordContent />
                </Suspense>
            </div>
             <footer className="mt-8 text-center text-sm text-muted-foreground pb-8">
                © {year} AndonPro. All rights reserved.
            </footer>
        </div>
    )
}


"use client";

import React, { useState, useTransition, Suspense } from 'react';
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
import { resetPassword } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

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

  const token = searchParams.get('token');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!token) {
        toast({ title: "Error", description: "Invalid or missing reset token.", variant: "destructive" });
        return;
    }
    startTransition(async () => {
      const result = await resetPassword(token, data.newPassword);
      if (result.success) {
        toast({
          title: "Password Reset Successful",
          description: "You can now log in with your new password.",
        });
        router.push('/login');
      } else {
        toast({
          title: "Password Reset Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  if (!token) {
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
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="space-y-1">
        <div className="flex justify-center p-6">
          <Logo />
        </div>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>
          Enter a new password for your account.
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
  );
}


export default function ResetPasswordPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Suspense fallback={
                <div className="flex items-center justify-center">
                    <LoaderCircle className="h-8 w-8 animate-spin" />
                </div>
            }>
                <ResetPasswordContent />
            </Suspense>
        </div>
    )
}

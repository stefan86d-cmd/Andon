
"use client";

import React, { useState, useTransition } from 'react';
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
import { requestPasswordReset } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const result = await requestPasswordReset(data.email);
      // We show a generic success message regardless of the result to prevent email enumeration
      toast({
        title: "Request Sent",
        description: result.message,
      });
      setSubmitted(true);
    });
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
                    <CardTitle>Forgot Password</CardTitle>
                    <CardDescription>
                        {submitted 
                        ? "Check your inbox for a password reset link." 
                        : "Enter your email and we'll send you a link to reset your password."
                        }
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    {!submitted ? (
                        <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                    type="email"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Send Reset Link
                            </Button>
                        </form>
                        </Form>
                    ) : (
                        <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                            Didn't receive an email? Check your spam folder or try again.
                        </p>
                        <Button variant="secondary" className="w-full" onClick={() => setSubmitted(false)}>
                            Try a different email
                            </Button>
                        </div>
                    )}
                    <div className="mt-4 text-center text-sm">
                        <Link href="/login" className="underline">
                        Back to login
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

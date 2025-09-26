
"use client"

import { AppLayout } from "@/components/layout/app-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoaderCircle, Globe, BadgeCheck, Headset, Shield, Lock } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { changePassword, updateUserPlan } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import type { Plan } from "@/lib/types";
import { CancelSubscriptionDialog } from "@/components/settings/cancel-subscription-dialog";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});
type PasswordFormValues = z.infer<typeof passwordFormSchema>;


const tiers = [
  { name: "Starter", price: 0 },
  { name: "Standard", price: 39.99 },
  { name: "Pro", price: 59.99 },
  { name: "Enterprise", price: 149.99 },
];

type Duration = '1' | '12' | '24' | '48';
type Currency = 'usd' | 'eur' | 'gbp';


export default function AccountSettingsPage() {
    const { currentUser, updateCurrentUser } = useUser();
    const [isProfileSubmitting, startProfileTransition] = useTransition();
    const [isPasswordSubmitting, startPasswordTransition] = useTransition();
    const [isPlanSubmitting, startPlanTransition] = useTransition();
    
    // Plan state
    const [duration, setDuration] = useState<Duration>('12');
    const [currency, setCurrency] = useState<Currency>('usd');
    const [newPlan, setNewPlan] = useState<Plan | undefined>();

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: currentUser?.firstName || "",
            lastName: currentUser?.lastName || "",
        },
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (currentUser) {
            profileForm.reset({
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
            });
            setNewPlan(currentUser.plan);
        }
    }, [currentUser, profileForm]);

    if (!currentUser) {
        return <AppLayout><div>Loading...</div></AppLayout>;
    }
    
    const onProfileSubmit = (data: ProfileFormValues) => {
        startProfileTransition(() => {
            updateCurrentUser(data);
            toast({
                title: "Profile Updated",
                description: "Your name has been updated successfully.",
            });
        });
    }

    const onPasswordSubmit = (data: PasswordFormValues) => {
        startPasswordTransition(async () => {
            const result = await changePassword(currentUser.email, data.currentPassword, data.newPassword);
            if (result.success) {
                toast({
                    title: "Password Updated",
                    description: "Your password has been changed successfully.",
                });
                passwordForm.reset();
            } else {
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: result.error,
                });
                 passwordForm.setError("currentPassword", {
                    type: "manual",
                    message: result.error,
                });
            }
        });
    }
    
    const handlePlanUpgrade = () => {
        if (!currentUser || !newPlan) return;
        if (newPlan === currentUser.plan) {
            toast({ title: "No Change", description: "You are already on this plan." });
            return;
        }

        startPlanTransition(async () => {
            const result = await updateUserPlan(currentUser.id, newPlan);
            if (result.success) {
                toast({
                title: "Plan Updated!",
                description: `Your plan has been successfully updated to ${newPlan}.`,
                });
                updateCurrentUser({ plan: newPlan });
            } else {
                toast({
                variant: "destructive",
                title: "Update Failed",
                description: result.error || "Could not update your plan.",
                });
            }
        });
    }
    
    const handleCancelConfirm = () => {
        toast({
            title: "Subscription Cancelled (Mock)",
            description: "Your subscription would be cancelled at the end of the current period.",
        });
    }

    const planName = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1);
    const availablePlans = Object.keys(tiers).filter(p => p !== 'starter') as Plan[];

    return (
        <AppLayout>
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-background p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">Manage Account</h1>
                    <p className="text-muted-foreground">Edit your profile, password, and subscription details.</p>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
                    <div className="grid gap-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal details here.</CardDescription>
                            </CardHeader>
                             <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={profileForm.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>First Name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Last Name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" defaultValue={currentUser.email} readOnly disabled/>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button type="submit" disabled={isProfileSubmitting}>
                                            {isProfileSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                            Update Profile
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Form>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Update your password. Make sure it's a strong one.</CardDescription>
                            </CardHeader>
                                <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={passwordForm.control}
                                            name="currentPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Current Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={passwordForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>New Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={passwordForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirm New Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                    <CardFooter>
                                        <Button type="submit" disabled={isPasswordSubmitting}>
                                            {isPasswordSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                            Update Password
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Form>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Plan & Billing</CardTitle>
                                <CardDescription>You are currently on the <span className="font-semibold">{planName}</span> plan.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Change Plan</Label>
                                    <div className="flex items-center space-x-2">
                                        <Select value={newPlan} onValueChange={(value) => setNewPlan(value as Plan)}>
                                            <SelectTrigger id="new-plan">
                                                <SelectValue placeholder="Choose a new plan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availablePlans.map(p => (
                                                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={duration} onValueChange={(value) => setDuration(value as any)}>
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
                                        <Select value={currency} onValueChange={(value) => setCurrency(value as any)}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="usd">USD</SelectItem>
                                                <SelectItem value="eur">EUR</SelectItem>
                                                <SelectItem value="gbp">GBP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Button onClick={handlePlanUpgrade} disabled={isPlanSubmitting || !newPlan || newPlan === currentUser.plan}>
                                      {isPlanSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                      {newPlan === currentUser.plan ? 'Current Plan' : (newPlan ? `Upgrade to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}` : 'Select a Plan')}
                                    </Button>
                                    {duration === '12' && <Badge variant="secondary">Save ~20%</Badge>}
                                    {duration === '24' && <Badge variant="secondary">Save ~30%</Badge>}
                                    {duration === '48' && <Badge variant="secondary">Save ~40%</Badge>}
                                </div>
                            </CardContent>
                             <CardFooter className="border-t pt-6">
                                <CancelSubscriptionDialog onConfirm={handleCancelConfirm}>
                                    <Button variant="destructive" className="w-full sm:w-auto">Cancel Subscription</Button>
                                </CancelSubscriptionDialog>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}

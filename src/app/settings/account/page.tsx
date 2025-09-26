
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
import { Logo } from "@/components/layout/logo";
import { Separator } from "@/components/ui/separator";
import { countries } from "@/lib/countries";


const profileFormSchema = z.object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    address: z.string().min(1, "Home address is required."),
    city: z.string().min(1, "City is required."),
    postalCode: z.string().min(1, "Postal code is required."),
    country: z.string().min(1, "Country is required."),
    phone: z.string().optional(),
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


const tiers: Record<Plan, { name: string, price: number }> = {
  starter: { name: "Starter", price: 0 },
  standard: { name: "Standard", price: 39.99 },
  pro: { name: "Pro", price: 59.99 },
  enterprise: { name: "Enterprise", price: 149.99 },
};

type Duration = '1' | '12' | '24' | '48';
type Currency = 'usd' | 'eur' | 'gbp';


export default function AccountSettingsPage() {
    const { currentUser, updateCurrentUser } = useUser();
    const [isProfileSubmitting, startProfileTransition] = useTransition();
    const [isPasswordSubmitting, startPasswordTransition] = useTransition();
    const [isPlanSubmitting, startPlanTransition] = useTransition();
    
    // State for toggling profile edit mode
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Plan state
    const [duration, setDuration] = useState<Duration>('12');
    const [currency, setCurrency] = useState<Currency>('usd');
    const [newPlan, setNewPlan] = useState<Plan | undefined>();

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: currentUser?.firstName || "",
            lastName: currentUser?.lastName || "",
            address: currentUser?.address || "",
            city: "", // Mock data does not have city, so we add it
            postalCode: "", // Mock data does not have postalCode
            country: currentUser?.country || "",
            phone: currentUser?.phone || "",
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
                address: currentUser.address,
                city: "", // default to empty
                postalCode: "", // default to empty
                country: currentUser.country,
                phone: currentUser.phone,
            });
            setNewPlan(currentUser.plan);
        }
    }, [currentUser, profileForm]);

    if (!currentUser) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    const onProfileSubmit = (data: ProfileFormValues) => {
        startProfileTransition(() => {
            updateCurrentUser(data);
            toast({
                title: "Profile Updated",
                description: "Your information has been updated successfully.",
            });
            setIsEditingProfile(false); // Go back to read-only view
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

    const getCountryName = (code: string) => {
        return countries.find(c => c.code === code)?.name || code;
    }

    return (
        <div className="container mx-auto flex min-h-screen items-center justify-center py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl">
                {/* Left Side */}
                <div className="flex flex-col gap-8">
                     <div className="flex justify-start">
                        <Link href="/">
                            <Logo />
                        </Link>
                    </div>
                     <div>
                        <h2 className="text-2xl font-bold mt-2">Manage Your Account</h2>
                        <p className="text-muted-foreground">
                            Update your profile, password, or subscription plan.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        {isEditingProfile ? (
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
                                                        <FormControl><Input {...field} /></FormControl>
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
                                                        <FormControl><Input {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" defaultValue={currentUser.email} readOnly disabled/>
                                        </div>
                                        <FormField
                                            control={profileForm.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Home Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123 Main St" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={profileForm.control}
                                                name="city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Anytown" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="postalCode"
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Postal Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="12345" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={profileForm.control}
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
                                                control={profileForm.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Phone Number (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input type="tel" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)} disabled={isProfileSubmitting}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isProfileSubmitting}>
                                            {isProfileSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Form>
                        ) : (
                            <>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">First Name</Label>
                                            <p>{currentUser.firstName}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Last Name</Label>
                                            <p>{currentUser.lastName}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Email</Label>
                                        <p>{currentUser.email}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Address</Label>
                                        <p>{currentUser.address || 'N/A'}</p>
                                    </div>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">City</Label>
                                            <p>{"Anytown"}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Postal Code</Label>
                                            <p>{"12345"}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Country</Label>
                                        <p>{getCountryName(currentUser.country) || 'N/A'}</p>
                                    </div>
                                     <div>
                                        <Label className="text-xs text-muted-foreground">Phone</Label>
                                        <p>{currentUser.phone || 'N/A'}</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={() => setIsEditingProfile(true)}>Update Profile</Button>
                                </CardFooter>
                            </>
                        )}
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
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
                                                <FormControl><Input type="password" {...field} /></FormControl>
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
                                                <FormControl><Input type="password" {...field} /></FormControl>
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
                                                <FormControl><Input type="password" {...field} /></FormControl>
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
                     <div className="text-center text-sm text-muted-foreground pt-4">
                        <Link href="/dashboard" className="underline">Back to Dashboard</Link>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex flex-col gap-8 pt-0 lg:pt-28">
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan & Billing</CardTitle>
                            <CardDescription>You are currently on the <span className="font-semibold">{planName}</span> plan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Change Plan</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <Select value={newPlan} onValueChange={(value) => setNewPlan(value as Plan)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a new plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availablePlans.map(p => (
                                                <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={duration} onValueChange={(value) => setDuration(value as any)}>
                                        <SelectTrigger>
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
                                        <SelectTrigger>
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
                             <Separator />
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Cancel Subscription</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    If you cancel, you will lose access to your plan's features at the end of your billing period.
                                </p>
                                <CancelSubscriptionDialog onConfirm={handleCancelConfirm}>
                                    <Button variant="destructive" className="w-full sm:w-auto">Cancel Subscription</Button>
                                </CancelSubscriptionDialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

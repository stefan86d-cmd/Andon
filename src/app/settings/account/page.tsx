
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
import { requestPasswordReset } from "@/app/actions";
import type { Plan } from "@/lib/types";
import { Logo } from "@/components/layout/logo";
import { countries } from "@/lib/countries";
import { useRouter } from "next/navigation";
import { format, isValid } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


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


export default function AccountSettingsPage() {
    const { currentUser, updateCurrentUser } = useUser();
    const [isProfileSubmitting, startProfileTransition] = useTransition();
    const [isPasswordRequesting, startPasswordRequestTransition] = useTransition();
    const router = useRouter();
    
    // State for toggling profile edit mode
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);


    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            address: "",
            city: "", 
            postalCode: "", 
            country: "",
            phone: "",
        },
    });


    useEffect(() => {
        if (currentUser) {
            profileForm.reset({
                firstName: currentUser.firstName || "",
                lastName: currentUser.lastName || "",
                address: currentUser.address || "",
                city: currentUser.city || "",
                postalCode: currentUser.postalCode || "",
                country: currentUser.country || "",
                phone: currentUser.phone || "",
            });
        }
    }, [currentUser, profileForm, isEditingProfile]);

    if (!currentUser || !currentUser.plan) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    const onProfileSubmit = (data: ProfileFormValues) => {
        startProfileTransition(async () => {
            try {
                await updateCurrentUser(data);
                toast({
                    title: "Profile Updated",
                    description: "Your information has been updated successfully.",
                });
                setIsEditingProfile(false); // Go back to read-only view
                router.refresh();
            } catch (error) {
                // Error toast is handled in the context
            }
        });
    }

    const handlePasswordResetRequest = () => {
        startPasswordRequestTransition(async () => {
            if (!currentUser?.email) return;
            const result = await requestPasswordReset(currentUser.email);
            if (result.success) {
                toast({
                    title: "Password Reset Email Sent",
                    description: result.message,
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "Request Failed",
                    description: "Could not send password reset email. Please try again later.",
                });
            }
        });
    };
    

    const getCountryName = (code: string) => {
        return countries.find(c => c.code === code)?.name || code;
    }
    
    const planName = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1);

    const endDate = currentUser.subscriptionEndsAt && isValid(new Date(currentUser.subscriptionEndsAt))
        ? format(new Date(currentUser.subscriptionEndsAt), "MMMM d, yyyy")
        : "N/A";

    const subscriptionText = () => {
        if (currentUser.plan === 'starter') {
            return "The Starter plan is always free.";
        }
        if (currentUser.subscriptionStatus === 'canceled') {
            return `Your plan access ends on ${endDate}.`;
        }
        return `Your plan renews on ${endDate}.`;
    };

    return (
        <div className="bg-muted">
            <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
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
                                            <p>{profileForm.getValues('address') || 'N/A'}</p>
                                        </div>
                                         <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs text-muted-foreground">City</Label>
                                                <p>{profileForm.getValues('city') || "N/A"}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Postal Code</Label>
                                                <p>{profileForm.getValues('postalCode') || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Country</Label>
                                            <p>{getCountryName(profileForm.getValues('country')) || 'N/A'}</p>
                                        </div>
                                         <div>
                                            <Label className="text-xs text-muted-foreground">Phone</Label>
                                            <p>{profileForm.getValues('phone') || 'N/A'}</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button onClick={() => setIsEditingProfile(true)}>Update Profile</Button>
                                    </CardFooter>
                                </>
                            )}
                        </Card>

                         <Card>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1" className="border-b-0">
                                    <AccordionTrigger className="p-6 hover:no-underline">
                                        <CardTitle>Change Password</CardTitle>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <CardContent className="space-y-4 pt-0">
                                           <p className="text-sm text-muted-foreground">To change your password, we'll send a secure reset link to your email address.</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button onClick={handlePasswordResetRequest} disabled={isPasswordRequesting}>
                                                {isPasswordRequesting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                Send Reset Link
                                            </Button>
                                        </CardFooter>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
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
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border bg-card-foreground/5 p-6">
                                    <h3 className="text-lg font-semibold">Current Plan: {planName}</h3>
                                    <p className="text-sm text-muted-foreground">Your workspace is on the {planName} plan.</p>
                                     <p className="text-sm text-muted-foreground mt-2">
                                        {subscriptionText()}
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href="/settings/billing" className={cn(buttonVariants({ variant: "outline" }))}>
                                    View Billing Details
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
                <footer className="mt-8 text-center text-sm text-muted-foreground">
                    © {year} AndonPro. All rights reserved.
                </footer>
            </div>
        </div>
    );
}

    

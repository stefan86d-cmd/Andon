
"use client"

import { AppLayout } from "@/components/layout/app-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, LoaderCircle } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useState, useTransition } from "react";
import { CancelSubscriptionDialog } from "@/components/settings/cancel-subscription-dialog";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { changePassword } from "@/app/actions";

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function SettingsPage() {
    const { currentUser, updateCurrentUser } = useUser();
    const [isCancelled, setIsCancelled] = useState(false);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isPasswordSubmitting, startPasswordTransition] = useTransition();

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const handleCancelConfirm = () => {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 1);
        setEndDate(futureDate);
        setIsCancelled(true);
    };

    const handleRenew = () => {
        setIsCancelled(false);
        setEndDate(null);
    }
    
    if (!currentUser) {
        return <AppLayout><div>Loading...</div></AppLayout>;
    }

    const onPasswordSubmit = (data: PasswordFormValues) => {
        startPasswordTransition(async () => {
            const result = await changePassword(currentUser.email, data.currentPassword, data.newPassword);

            if (result.success) {
                toast({
                    title: "Password Updated",
                    description: "Your password has been changed successfully.",
                });
                form.reset();
            } else {
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: result.error,
                });
                 form.setError("currentPassword", {
                    type: "manual",
                    message: result.error,
                });
            }
        });
    }

    const [firstName, lastName] = currentUser.name.split(" ");
    const hasNotificationsTab = currentUser.role === 'admin' || currentUser.role === 'supervisor';
    const hasSubscriptionTab = currentUser.role === 'admin';
    const tabCount = 1 + (hasNotificationsTab ? 1 : 0) + (hasSubscriptionTab ? 1 : 0);

    const planName = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1);
    
    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`;
        }
        return parts[0]?.[0] || '';
    }

    const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newFirstName = formData.get('firstName') as string;
        const newLastName = formData.get('lastName') as string;
        
        if (currentUser) {
            const updatedUser = {
                ...currentUser,
                name: `${newFirstName} ${newLastName}`,
            };
            updateCurrentUser(updatedUser);
            toast({
                title: "Profile Updated",
                description: "Your name has been updated.",
            });
        }
    }

    return (
        <AppLayout>
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-background p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">Settings</h1>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
                    <Tabs defaultValue="profile" className="w-full">
                        {tabCount > 1 && (
                            <div className="flex justify-center mb-4">
                                <TabsList className={cn(
                                    "grid w-full max-w-lg",
                                    tabCount === 2 && "grid-cols-2",
                                    tabCount === 3 && "grid-cols-3"
                                )}>
                                    <TabsTrigger value="profile">My Profile</TabsTrigger>
                                    {hasNotificationsTab && (
                                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                                    )}
                                    {hasSubscriptionTab && (
                                        <TabsTrigger value="subscription">Subscription</TabsTrigger>
                                    )}
                                </TabsList>
                            </div>
                        )}
                        <TabsContent value="profile">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <form onSubmit={handleProfileUpdate}>
                                        <CardHeader>
                                            <CardTitle>My Profile</CardTitle>
                                            <CardDescription>Update your personal information.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-20 w-20 text-3xl border-2 border-primary">
                                                    <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="firstName">First Name</Label>
                                                    <Input name="firstName" id="firstName" defaultValue={firstName} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="lastName">Last Name</Label>
                                                    <Input name="lastName" id="lastName" defaultValue={lastName} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input id="email" type="email" defaultValue={currentUser.email} readOnly disabled/>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button>Update Profile</Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>Update your password. Make sure it's a strong one.</CardDescription>
                                    </CardHeader>
                                     <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onPasswordSubmit)}>
                                            <CardContent className="space-y-4">
                                                <FormField
                                                    control={form.control}
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
                                                    control={form.control}
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
                                                    control={form.control}
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
                             </div>
                        </TabsContent>
                        {hasNotificationsTab && (
                            <TabsContent value="notifications">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notifications</CardTitle>
                                        <CardDescription>Manage how you receive notifications.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                            <h3 className="text-lg font-medium">By Email</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <Label htmlFor="new-issue-reported" className="text-base">New Issue Reported</Label>
                                                        <p className="text-sm text-muted-foreground">Receive an email when a new issue is reported on any line.</p>
                                                    </div>
                                                    <Switch id="new-issue-reported" defaultChecked />
                                                </div>
                                                <div className="flex items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <Label htmlFor="issue-resolved" className="text-base">Issue Resolved</Label>
                                                        <p className="text-sm text-muted-foreground">Receive an email when an issue is marked as resolved.</p>
                                                    </div>
                                                    <Switch id="issue-resolved" />
                                                </div>
                                            </div>
                                    </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                        {hasSubscriptionTab && (
                            <TabsContent value="subscription">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Subscription Plan</CardTitle>
                                        <CardDescription>Manage your billing and subscription details.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="rounded-lg border bg-card-foreground/5 p-6">
                                            <h3 className="text-lg font-semibold">Current Plan: {planName}</h3>
                                            <p className="text-sm text-muted-foreground">Your workspace is on the {planName} plan.</p>
                                            {isCancelled && endDate ? (
                                                <p className="text-sm font-semibold text-destructive mt-2">Your plan is cancelled and will end on {format(endDate, "MMMM d, yyyy")}.</p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground mt-2">Your plan renews on January 1, 2025.</p>
                                            )}
                                        </div>
                                        {!isCancelled ? (
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                 <Link href="/pricing" className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto")}>
                                                    Upgrade or Change Plan
                                                </Link>
                                                <CancelSubscriptionDialog onConfirm={handleCancelConfirm}>
                                                    <Button variant="destructive" className="w-full sm:w-auto">Cancel Subscription</Button>
                                                </CancelSubscriptionDialog>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Button onClick={handleRenew} className="w-full sm:w-auto">Renew Plan</Button>
                                                <Link href="/pricing" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
                                                    View Plans
                                                </Link>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </main>
        </AppLayout>
    );
}

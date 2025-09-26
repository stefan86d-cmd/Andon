
"use client"

import { AppLayout } from "@/components/layout/app-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/contexts/user-context";
import { useState } from "react";
import { CancelSubscriptionDialog } from "@/components/settings/cancel-subscription-dialog";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { currentUser } = useUser();
    const [isCancelled, setIsCancelled] = useState(false);
    const [endDate, setEndDate] = useState<Date | null>(null);

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

    const hasNotificationsCard = currentUser.role === 'admin' || currentUser.role === 'supervisor';
    const hasSubscriptionCard = currentUser.role === 'admin';

    const planName = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1);
    
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
    }

    return (
        <AppLayout>
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-background p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">Settings</h1>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6 lg:grid-cols-2">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>My Profile</CardTitle>
                                <CardDescription>Your personal information is displayed below.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20 text-3xl border-2 border-primary">
                                        <AvatarFallback>{getInitials(currentUser.firstName, currentUser.lastName)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xl font-semibold">{currentUser.firstName} {currentUser.lastName}</p>
                                        <p className="text-muted-foreground">{currentUser.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Link href="/settings/account" className={cn(buttonVariants({ variant: "default" }))}>
                                    Manage Account & Billing
                                </Link>
                            </CardFooter>
                        </Card>

                        {hasSubscriptionCard && (
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
                                </CardContent>
                                <CardFooter>
                                     <a href="/settings/billing" className={cn(buttonVariants({ variant: "outline" }))} target="_blank" rel="noopener noreferrer">
                                        View Billing Details
                                    </a>
                                </CardFooter>
                            </Card>
                        )}
                    </div>
                     <div className="grid gap-6">
                        {hasNotificationsCard && (
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
                        )}
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}

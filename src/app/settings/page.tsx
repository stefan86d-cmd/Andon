
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/contexts/user-context";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import type { Theme } from "@/lib/types";

function SettingsPageContent() {
    const { currentUser, updateCurrentUser } = useUser();
    const { theme, setTheme } = useTheme();

    if (!currentUser) {
        return <div>Loading...</div>;
    }
    
    const handleNotificationChange = (key: 'newIssue' | 'issueResolved' | 'muteSound', value: boolean) => {
        const currentPrefs = currentUser.notificationPreferences || {};
        updateCurrentUser({ notificationPreferences: { ...currentPrefs, [key]: value } });
        toast({ title: "Preferences Saved", description: "Your notification settings have been updated."});
    };
    
    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        updateCurrentUser({ theme: newTheme });
        toast({ title: "Preferences Saved", description: "Your theme preference has been updated."});
    };

    const hasNotificationsCard = currentUser.role === 'admin' || currentUser.role === 'supervisor';
    const canManageAccount = currentUser.role === 'admin';

    const planName = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1);
    
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
    }

    const renewalDate = currentUser.subscriptionEndsAt 
        ? format(new Date(currentUser.subscriptionEndsAt), "MMMM d, yyyy")
        : "N/A";

    return (
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
                         {canManageAccount && (
                            <CardFooter>
                                <Link href="/settings/account" className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2")}>
                                    Manage Account & Billing
                                </Link>
                            </CardFooter>
                         )}
                    </Card>

                    {canManageAccount && (
                         <Card>
                            <CardHeader>
                                <CardTitle>Subscription Plan</CardTitle>
                                <CardDescription>Manage your billing and subscription details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border bg-card-foreground/5 p-6">
                                    <h3 className="text-lg font-semibold">Current Plan: {planName}</h3>
                                    <p className="text-sm text-muted-foreground">Your workspace is on the {planName} plan.</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {currentUser.plan === 'starter' ? 'The Starter plan is always free.' : `Your plan renews on ${renewalDate}.`}
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                 <Link href="/settings/billing" className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2")}>
                                    View Billing Details
                                 </Link>
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
                                        <div className="flex items-center justify-between rounded-lg border p-4 dark:border-background">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="new-issue-reported" className="text-base">New Issue Reported</Label>
                                                <p className="text-sm text-muted-foreground">Receive an email when a new issue is reported on any line.</p>
                                            </div>
                                            <Switch 
                                                id="new-issue-reported" 
                                                checked={currentUser.notificationPreferences?.newIssue ?? true}
                                                onCheckedChange={(checked) => handleNotificationChange('newIssue', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-4 dark:border-background">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="issue-resolved" className="text-base">Issue Resolved</Label>
                                                <p className="text-sm text-muted-foreground">Receive an email when an issue is marked as resolved.</p>
                                            </div>
                                            <Switch 
                                                id="issue-resolved" 
                                                checked={currentUser.notificationPreferences?.issueResolved ?? false}
                                                onCheckedChange={(checked) => handleNotificationChange('issueResolved', checked)}
                                            />
                                        </div>
                                    </div>
                            </div>
                            <div className="space-y-2">
                                    <h3 className="text-lg font-medium">Sound</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between rounded-lg border p-4 dark:border-background">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="mute-sound" className="text-base">Mute Sound</Label>
                                                <p className="text-sm text-muted-foreground">Mute all notification sounds within the app.</p>
                                            </div>
                                            <Switch 
                                                id="mute-sound" 
                                                checked={currentUser.notificationPreferences?.muteSound ?? true}
                                                onCheckedChange={(checked) => handleNotificationChange('muteSound', checked)}
                                            />
                                        </div>
                                    </div>
                            </div>
                            </CardContent>
                        </Card>
                    )}
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of the application.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                defaultValue={currentUser.theme || 'system'}
                                onValueChange={(value: Theme) => handleThemeChange(value)}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="light" id="theme-light" />
                                    <Label htmlFor="theme-light">Light</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="dark" id="theme-dark" />
                                    <Label htmlFor="theme-dark">Dark</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="system" id="theme-system" />
                                    <Label htmlFor="theme-system">System</Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}

export default function SettingsPage() {
    return <SettingsPageContent />;
}

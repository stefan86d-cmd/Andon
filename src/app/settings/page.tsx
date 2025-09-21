
"use client"

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useUser } from "@/contexts/user-context";

export default function SettingsPage() {
    const { currentUser } = useUser();
    
    if (!currentUser) {
        return <AppLayout><div>Loading...</div></AppLayout>;
    }

    const [firstName, lastName] = currentUser.name.split(" ");

    return (
        <AppLayout>
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-background p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">Settings</h1>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList>
                            <TabsTrigger value="profile">My Profile</TabsTrigger>
                            {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
                                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                            )}
                             {(currentUser.role === 'admin') && (
                                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                            )}
                        </TabsList>
                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>My Profile</CardTitle>
                                    <CardDescription>Update your personal information.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                                            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <Button variant="outline">
                                            <Camera className="mr-2 h-4 w-4" />
                                            Change Photo
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input id="firstName" defaultValue={firstName} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input id="lastName" defaultValue={lastName} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" defaultValue={currentUser.email} readOnly disabled/>
                                    </div>
                                    <Button>Update Profile</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
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
                        {(currentUser.role === 'admin') && (
                            <TabsContent value="subscription">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Subscription Plan</CardTitle>
                                        <CardDescription>Manage your billing and subscription details.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="rounded-lg border bg-card-foreground/5 p-6">
                                            <h3 className="text-lg font-semibold">Current Plan: Pro</h3>
                                            <p className="text-sm text-muted-foreground">Your workspace is on the Pro plan, which includes AI-powered prioritization and advanced reporting.</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                             <Button className="w-full sm:w-auto">Upgrade to Enterprise</Button>
                                             <Button variant="destructive" className="w-full sm:w-auto">Cancel Subscription</Button>
                                        </div>
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

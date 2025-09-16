
"use client"

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { users } from "@/lib/data";
import { useTheme } from "next-themes";


export default function SettingsPage() {
    const currentUser = users.current;
    const { theme, setTheme } = useTheme();

    return (
        <AppLayout>
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-background p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">Settings</h1>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                <Tabs defaultValue="profile" orientation="vertical" className=" -ml-4">
                    <TabsList className="text-left justify-start h-full">
                        <div className="flex flex-col">
                            <TabsTrigger value="profile" className="justify-start">My Profile</TabsTrigger>
                            <TabsTrigger value="notifications" className="justify-start">Notifications</TabsTrigger>
                            <TabsTrigger value="appearance" className="justify-start">Appearance</TabsTrigger>
                        </div>
                    </TabsList>
                    
                    <TabsContent value="profile" className="mt-0">
                         <Card>
                            <CardHeader>
                                <CardTitle>My Profile</CardTitle>
                                <CardDescription>Update your personal information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" defaultValue={currentUser.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue={currentUser.email} />
                                </div>
                                <Button>Update Profile</Button>
                            </CardContent>
                         </Card>
                    </TabsContent>
                    <TabsContent value="notifications" className="mt-0">
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
                                                <Label htmlFor="issue-assigned" className="text-base">Issue Assigned</Label>
                                                <p className="text-sm text-muted-foreground">Receive an email when a new issue is assigned to you.</p>
                                            </div>
                                            <Switch id="issue-assigned" defaultChecked />
                                        </div>
                                         <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="status-update" className="text-base">Status Updates</Label>
                                                <p className="text-sm text-muted-foreground">Receive an email when an issue you reported is updated.</p>
                                            </div>
                                            <Switch id="status-update" />
                                        </div>
                                         <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="weekly-digest" className="text-base">Weekly Digest</Label>
                                                <p className="text-sm text-muted-foreground">Get a summary of the week's activity on your production line.</p>
                                            </div>
                                            <Switch id="weekly-digest" defaultChecked />
                                        </div>
                                    </div>
                               </div>
                            </CardContent>
                         </Card>
                    </TabsContent>
                    <TabsContent value="appearance" className="mt-0">
                         <Card>
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize the look and feel of the application.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                     <Label className="text-base">Theme</Label>
                                     <p className="text-sm text-muted-foreground">Select the theme for the application.</p>
                                </div>
                               <RadioGroup
                                    defaultValue={theme}
                                    onValueChange={setTheme}
                                    className="grid max-w-md grid-cols-1 md:grid-cols-3 gap-8 pt-2"
                                >
                                    <div>
                                        <RadioGroupItem value="light" id="light" className="peer sr-only" />
                                        <Label
                                            htmlFor="light"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                           <div className="w-full bg-gray-100 rounded-md p-2">
                                                <div className="h-2 w-full rounded-sm bg-gray-300" />
                                                <div className="h-2 w-1/2 rounded-sm bg-gray-300 mt-1" />
                                           </div>
                                            <span className="block w-full p-2 text-center font-normal">Light</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                                        <Label
                                            htmlFor="dark"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            <div className="w-full bg-gray-900 rounded-md p-2">
                                                <div className="h-2 w-full rounded-sm bg-gray-700" />
                                                <div className="h-2 w-1/2 rounded-sm bg-gray-700 mt-1" />
                                           </div>
                                            <span className="block w-full p-2 text-center font-normal">Dark</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="system" id="system" className="peer sr-only" />
                                        <Label
                                            htmlfor="system"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                           <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-md p-2 border border-gray-300 dark:border-gray-700">
                                                <div className="h-2 w-full rounded-sm bg-gray-300 dark:bg-gray-700" />
                                                <div className="h-2 w-1/2 rounded-sm bg-gray-300 dark:bg-gray-700 mt-1" />
                                           </div>
                                            <span className="block w-full p-2 text-center font-normal">System</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                         </Card>
                    </TabsContent>
                </Tabs>
                </div>
            </main>
        </AppLayout>
    );
}

    
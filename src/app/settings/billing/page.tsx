
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { updateUserPlan } from "@/app/actions";
import type { Plan } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CancelSubscriptionDialog } from "@/components/settings/cancel-subscription-dialog";
import { Logo } from "@/components/layout/logo";


const tiers: Record<Plan, { name: string, price: number }> = {
  starter: { name: "Starter", price: 0 },
  standard: { name: "Standard", price: 39.99 },
  pro: { name: "Pro", price: 59.99 },
  enterprise: { name: "Enterprise", price: 149.99 },
};

type Duration = '1' | '12' | '24' | '48';
type Currency = 'usd' | 'eur' | 'gbp';


export default function BillingPage() {
    const { currentUser, updateCurrentUser } = useUser();
    const [isPlanSubmitting, startPlanTransition] = useTransition();

    const [duration, setDuration] = useState<Duration>('12');
    const [currency, setCurrency] = useState<Currency>('usd');
    const [newPlan, setNewPlan] = useState<Plan | undefined>();

    if (!currentUser) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        );
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
        <div className="container mx-auto flex min-h-screen items-center justify-center py-12">
            <div className="w-full max-w-2xl">
                 <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Logo />
                    </Link>
                </div>
                 <div>
                    <h2 className="text-2xl font-bold mt-2 text-center">Plan & Billing</h2>
                    <p className="text-muted-foreground text-center">
                        You are currently on the <span className="font-semibold">{planName}</span> plan.
                    </p>
                </div>
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Change Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
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
                 <div className="text-center text-sm text-muted-foreground pt-8">
                    <Link href="/settings/account" className="underline">Back to Account Management</Link>
                </div>
            </div>
        </div>
    );
}


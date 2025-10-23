
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCheckoutSession, updateUserPlan, sendWelcomeEmail } from '@/app/actions';
import { useUser } from '@/contexts/user-context';
import { LoaderCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';
import { toast } from '@/hooks/use-toast';
import { addMonths, format } from 'date-fns';
import Link from 'next/link';
import type { Plan, User } from '@/lib/types';


function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { currentUser, updateCurrentUser, loading: userLoading } = useUser();
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [orderFulfilled, setOrderFulfilled] = useState(false);
    const [planDetails, setPlanDetails] = useState<{ plan: Plan, startDate: Date, endDate: Date } | null>(null);


    useEffect(() => {
        if (!sessionId) {
            setErrorMessage("No session ID provided.");
            setStatus('error');
            return;
        }
        
        if (userLoading) {
            return; // Wait for user to be loaded
        }

        if (!currentUser) {
            setErrorMessage("User not authenticated. Please log in to see your updated plan.");
            setStatus('error');
            return;
        }

        if (orderFulfilled) {
            return;
        }

        const fulfillOrder = async () => {
            try {
                const { session, error } = await getCheckoutSession(sessionId);

                if (error || !session) {
                    setErrorMessage(error || 'Failed to retrieve checkout session.');
                    setStatus('error');
                    return;
                }

                const plan = session.metadata?.plan as Plan;
                const duration = parseInt(session.metadata?.duration || '1', 10);
                const isNewUser = session.metadata?.isNewUser === 'true';

                if (!plan) {
                    setErrorMessage('Plan information is missing from the session.');
                    setStatus('error');
                    return;
                }
                
                const now = new Date();
                const subscriptionEndDate = addMonths(now, duration);
                
                const planUpdateData: Partial<User> = {
                    plan,
                    subscriptionId: session.subscription as string,
                    subscriptionStartsAt: now,
                    subscriptionEndsAt: subscriptionEndDate,
                };
                
                await updateUserPlan(currentUser.id, plan, planUpdateData);
                await updateCurrentUser(planUpdateData);

                setPlanDetails({ plan, startDate: now, endDate: subscriptionEndDate });
                
                if (isNewUser) {
                    await sendWelcomeEmail(currentUser.id);
                }

                setOrderFulfilled(true);
                setStatus('success');

            } catch (e: any) {
                console.error("Fulfill order error:", e);
                setErrorMessage('Failed to update your plan in our system. Please contact support.');
                setStatus('error');
            }
        };

        fulfillOrder();

    }, [sessionId, currentUser, userLoading, router, updateCurrentUser, orderFulfilled]);

    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => {
                window.location.href = '/dashboard';
            }, 5000); // 5-second delay
            return () => clearTimeout(timer);
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center gap-4">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Finalizing your subscription...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <Card>
                <CardHeader className="items-center">
                     <XCircle className="h-12 w-12 text-destructive mb-4" />
                    <CardTitle>Checkout Error</CardTitle>
                    <CardDescription>{errorMessage}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href={currentUser ? "/settings/billing" : "/login"}>
                            {currentUser ? "Go to Billing" : "Go to Login"}
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="text-center">
            <CardHeader className="items-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <CardTitle>Payment Successful!</CardTitle>
                <CardDescription>Your subscription has been activated. Welcome aboard!</CardDescription>
            </CardHeader>
            <CardContent>
                 {planDetails && (
                    <div className="text-sm text-muted-foreground space-y-2 text-left bg-muted p-4 rounded-md">
                        <p><strong>Plan:</strong> <span className="capitalize">{planDetails.plan}</span></p>
                        <p><strong>Subscription Active:</strong> {format(planDetails.startDate, "MMMM d, yyyy")} - {format(planDetails.endDate, "MMMM d, yyyy")}</p>
                    </div>
                )}
                <p className="text-sm text-muted-foreground mt-4">You will be redirected to your dashboard shortly.</p>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="bg-muted min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Logo />
                </div>
                <Suspense fallback={<div className="flex items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>}>
                    <SuccessContent />
                </Suspense>
            </div>
        </div>
    )
}

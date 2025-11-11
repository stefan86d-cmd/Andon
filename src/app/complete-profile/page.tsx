
"use client";

import React, { Suspense, useEffect, useTransition, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/layout/logo";
import { LoaderCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from '@/lib/countries';
import type { Plan, Role, Currency } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/user-context';
import { cancelRegistrationAndDeleteUser, sendWelcomeEmail } from '@/app/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

type Duration = "1" | "12" | "24" | "48";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  address: z.string().min(1, "Address is required."),
  city: z.string().min(1, "City is required."),
  postalCode: z.string().min(1, "Postal code is required."),
  country: z.string().min(1, "Country is required."),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


function TermsOfServiceDialog() {
    const [scrolledToBottom, setScrolledToBottom] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 1) { // +1 for pixel-perfect precision
            setScrolledToBottom(true);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button type="button" className="underline">Terms of Service</button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl" hideCloseButton>
                <DialogHeader>
                    <DialogTitle>Terms of Service</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-6" onScroll={handleScroll}>
                    <div className="prose dark:prose-invert max-w-none">
                        <p className='text-sm text-muted-foreground'>Last Updated: September 27, 2025</p>
                        <p>Welcome to AndonPro. These Terms of Service ("Terms") govern your access to and use of the AndonPro application, website, and services (collectively, the "Service"). Please read them carefully.</p>

                        <h3>1. Acceptance of Terms</h3>
                        <p>By creating an account or by using our Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use the Service.</p>
                        
                        <h3>2. Use of the Service</h3>
                        <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for all data and information you input into the Service ("User Data") and for any consequences thereof.</p>

                        <h3>3. User Accounts</h3>
                        <p>To use the Service, you must create an account. You are responsible for safeguarding your account password and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. The first user to register for an organization is designated as the "Admin" and is responsible for managing other users within that organization.</p>

                        <h3>4. Subscriptions and Billing</h3>
                        <p>The Service is billed on a subscription basis. You will be billed in advance on a recurring, periodic basis (such as monthly or annually), depending on the subscription plan you select. All subscriptions will automatically renew under the then-current rates unless you cancel your subscription through your account management page.</p>

                        <h3>5. User Data and Intellectual Property</h3>
                        <p>You retain all ownership rights to your User Data. We do not claim any ownership over your data. However, you grant us a worldwide, royalty-free license to use, reproduce, modify, and display the User Data solely for the purpose of providing and improving the Service. Our own materials, including our logo, design, software, and content ("AndonPro IP"), are protected by intellectual property laws and are our exclusive property.</p>

                        <h3>6. Limitation of Liability</h3>
                        <p>To the fullest extent permitted by law, AndonPro shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Service; (b) any conduct or content of any third party on the Service.</p>

                        <h3>7. Termination</h3>
                        <p>We may suspend or terminate your account and access to the Service at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is otherwise harmful to other users of the Service, us, or third parties. You may cancel your account at any time.</p>

                        <h3>8. Governing Law</h3>
                        <p>These Terms shall be governed by the laws of Finland, without respect to its conflict of laws principles.</p>

                        <h3>9. Changes to Terms</h3>
                        <p>We reserve the right to modify these Terms at any time. We will provide notice of any significant changes by posting the new Terms on our site. Your continued use of the Service after any such change constitutes your acceptance of the new Terms.</p>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button disabled={!scrolledToBottom}>
                            {scrolledToBottom ? 'Close' : 'Scroll to the bottom to close'}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, loading: userLoading, updateCurrentUser, logout } = useUser();

  const [isSubmitting, startTransition] = useTransition();
  const [isCancelling, startCancellationTransition] = useTransition();

  const plan = (searchParams.get('plan') as Plan) || 'starter';
  const duration = (searchParams.get('duration') as Duration) || '1';
  const currency = (searchParams.get('currency') as Currency) || 'usd';
  const isStarterPlan = plan === 'starter';

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "", lastName: "", address: "", city: "", postalCode: "", country: "", phone: "",
    },
  });

  useEffect(() => {
    if (!userLoading && !currentUser) {
      toast({ title: "Not Authenticated", description: "You must be signed in to complete your profile.", variant: "destructive" });
      router.push('/register');
    }

    if (currentUser) {
      form.reset({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        address: currentUser.address || "",
        city: currentUser.city || "",
        postalCode: currentUser.postalCode || "",
        country: currentUser.country || "",
        phone: currentUser.phone || ""
      });
    }
  }, [currentUser, userLoading, router, form]);

  const handleProfileSave = async (data: ProfileFormValues) => {
    if (!currentUser || !currentUser.id) {
      toast({ title: "Authentication Error", description: "Your session has expired. Please sign in again.", variant: "destructive" });
      return false;
    }

    try {
      const userRole: Role = "admin"; // First user is always admin
      const userProfileData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: currentUser.email,
        role: userRole,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        orgId: currentUser.id,
        plan: 'starter' as Plan, // Always assign starter plan on profile completion
      };

      await updateCurrentUser(userProfileData);
      return true;
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({ title: "Profile Update Failed", description: "Could not save your profile. Please try again.", variant: "destructive" });
      return false;
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const isProfileValid = await form.trigger();
      if (!isProfileValid) {
        toast({ title: "Incomplete Profile", description: "Please fill out all required profile fields before proceeding.", variant: "destructive" });
        return;
      }
  
      const profileData = form.getValues();
      const profileSaved = await handleProfileSave(profileData);
  
      if (!profileSaved || !currentUser) return;
  
      if (isStarterPlan) {
        await sendWelcomeEmail(currentUser.id);
        toast({
          title: "Registration Complete!",
          description: `Welcome to the Starter plan. Your account is ready!`,
        });
        router.push(`/dashboard`);
      } else {
        // Redirect to the in-app billing page to complete payment
        const billingUrl = `/settings/billing?plan=${plan}&duration=${duration}&currency=${currency}&new_user=true`;
        router.push(billingUrl);
      }
    });
  };

  const handleCancelRegistration = () => {
    if (!currentUser) return;
    startCancellationTransition(async () => {
      const result = await cancelRegistrationAndDeleteUser(currentUser.id);
      if (result.success) {
        await logout();
        toast({
          title: "Registration Canceled",
          description: "Your registration has been successfully canceled.",
        });
      } else {
        toast({
          title: "Cancellation Failed",
          description:
            !result.success && "error" in result
              ? result.error
              : "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  if (userLoading || !currentUser) {
    return <div className="flex h-screen items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="bg-muted">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
        <div className="w-full max-w-lg">
          <div className="flex justify-center mb-8"><a href="/"><Logo /></a></div>
          <Card>
            <CardHeader className="text-center">
              <h2 className="text-2xl font-bold">Complete Your Profile</h2>
              <p className="text-muted-foreground">Just a few more details to get you started.</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form id="profile-form" className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="postalCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {countries.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl><Input type="tel" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground text-center">
                By clicking the button below, you agree to our <TermsOfServiceDialog />.
              </p>
              <div className="w-full flex flex-col sm:flex-row gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto" disabled={isCancelling}>Cancel</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your account and you will have to start over. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Go Back</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelRegistration} disabled={isCancelling}>
                        {isCancelling && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Yes, cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting || isCancelling}>
                  {(isSubmitting || isCancelling) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  {isStarterPlan ? 'Complete Registration' : 'Continue to Payment'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AndonPro. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>}>
      <CompleteProfileContent />
    </Suspense>
  );
}

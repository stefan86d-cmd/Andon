
'use server';

import type { Issue, Plan, ProductionLine, Role, User } from '@/lib/types';
import { handleFirestoreError } from '@/lib/firestore-helpers';
import { sendEmail } from '@/lib/email';
import Stripe from 'stripe';
import { db as dbFn } from '@/firebase/server';
import { adminAuth } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getClientInstances } from "@/firebase/client"; 

import {
    getUserByEmail,
    getUserById,
    addUser,
    editUser,
    deleteUser,
    updateUserPlan,
    sendPasswordChangedEmail,
    changePassword,
    reportIssue,
    updateIssue,
    getProductionLines,
    createProductionLine,
    editProductionLine,
    deleteProductionLine,
    getAllUsers,
    requestPasswordReset
} from '@/lib/server-actions';


export {
    getUserByEmail,
    getUserById,
    addUser,
    editUser,
    deleteUser,
    updateUserPlan,
    sendPasswordChangedEmail,
    changePassword,
    reportIssue,
    updateIssue,
    getProductionLines,
    createProductionLine,
    editProductionLine,
    deleteProductionLine,
    getAllUsers,
    requestPasswordReset
};


const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// ---------------- User / Firestore Actions ----------------

export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<{ id: string }> {
  const db = dbFn();
  if (!db) throw new Error("Firestore not initialized");

  const userRef = db.collection('users').doc(userId);
  const userSnapshot = await userRef.get();
  const userData = userSnapshot.data() as User | undefined;

  // 1. If user has a Stripe ID and it's valid, return it.
  if (userData?.stripeCustomerId) {
    try {
      const stripeCustomer = await stripe.customers.retrieve(userData.stripeCustomerId);
      if (stripeCustomer && !stripeCustomer.deleted) {
        return { id: stripeCustomer.id };
      }
    } catch (error) {
      console.warn(`Stripe customer ID ${userData.stripeCustomerId} for user ${userId} is invalid. A new one will be created.`);
    }
  }

  // 2. Create a new Stripe customer.
  const newCustomer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  // 3. Save the new customer ID to Firestore.
  await userRef.update({ stripeCustomerId: newCustomer.id });

  return { id: newCustomer.id };
}


// ... (keep your user, issue, production line, and email functions unchanged) ...

// ---------------- Stripe Checkout ----------------

type Duration = '1' | '12' | '24' | '48';
type Currency = 'usd' | 'eur' | 'gbp';


export async function createCheckoutSession({
  customerId,
  plan,
  duration,
  currency,
  metadata = {},
  returnPath,
}: {
  customerId: string;
  plan: Plan;
  duration: Duration;
  currency: Currency;
  metadata?: Record<string, string>;
  returnPath?: string;
}) {
  try {
    if (plan === 'starter' || plan === 'custom') {
      throw new Error('Cannot create checkout session for starter or custom plans.');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://andonpro.com';
    const durationInMonths = parseInt(duration, 10);

    // The price ID now always corresponds to the discounted monthly rate for that tier.
    const priceIdEnvVar = `STRIPE_PRICE_ID_${plan.toUpperCase()}_${duration}_${currency.toUpperCase()}`;
    const priceId = process.env[priceIdEnvVar];

    if (!priceId) {
      throw new Error(`Price ID for plan '${plan}', duration '${duration}', currency '${currency}' is not configured. Please check your environment variables (looking for ${priceIdEnvVar}).`);
    }

    const mode: Stripe.Checkout.SessionCreateParams.Mode = 'subscription';

    const returnUrl = returnPath
      ? `${baseUrl}${returnPath}`
      : `${baseUrl}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`;
      
    // Set up a trial period for the selected duration.
    // Stripe trials are in days. We'll approximate months as 30 days.
    // Important: For durations > 1, the user pays nothing today and the first payment
    // is at the end of the trial period. The price used is the monthly one.
    const trialPeriodDays = durationInMonths > 1 ? durationInMonths * 30 : undefined;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      currency,
      ui_mode: 'embedded',
      return_url: returnUrl,
      metadata,
      automatic_tax: { enabled: false },
      subscription_data: {
        metadata,
        trial_period_days: trialPeriodDays,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log(`✅ Created subscription checkout session: ${session.id}`);

    return { clientSecret: session.client_secret };
  } catch (error: any) {
    console.error('❌ Stripe session error:', error);
    throw new Error(error.message || 'Failed to create Stripe checkout session.');
  }
}

export async function sendWelcomeEmail(userId: string) {
  try {
    const user = await getUserById(userId);
    if (!user) return { success: false, error: "User not found" };

    await sendEmail({
      to: user.email,
      subject: "Welcome to AndonPro!",
      html: `<h1>Welcome, ${user.firstName}!</h1><p>Your account is ready. <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard">Go to your dashboard</a>.</p>`
    });
    return { success: true };
  } catch (err: any) {
    return handleFirestoreError(err);
  }
}

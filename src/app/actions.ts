
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
    const priceIdEnvVar = `STRIPE_PRICE_ID_${plan.toUpperCase()}_1_${currency.toUpperCase()}`;
    const priceId = process.env[priceIdEnvVar];

    if (!priceId) {
      throw new Error(
        `Price ID for plan '${plan}' (1 Month, ${currency.toUpperCase()}) is not configured. (Expected ${priceIdEnvVar})`
      );
    }

    // Log for clarity
    console.log(`Creating checkout for ${plan} plan, ${duration} months, ${currency.toUpperCase()}`);

    // --- Unified coupon setup ---
    const COUPONS: Record<string, string | undefined> = {
      '12': process.env.STRIPE_COUPON_20_OFF, // 12-month upfront
      '24': process.env.STRIPE_COUPON_30_OFF, // 24-month upfront
      '48': process.env.STRIPE_COUPON_40_OFF, // 48-month upfront
    };
    const couponId = COUPONS[duration];

    // --- Upfront logic ---
    const isUpfront = duration !== '1';
    const trialMonths = isUpfront ? parseInt(duration) : 0;

    const returnUrl = returnPath
      ? `${baseUrl}${returnPath}`
      : `${baseUrl}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`;

    // --- Build the session parameters ---
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: isUpfront ? trialMonths : 1, // Pay upfront for multiple months
        },
      ],
      discounts: couponId ? [{ coupon: couponId }] : undefined,
      ui_mode: 'embedded',
      return_url: returnUrl,
      metadata,
      automatic_tax: { enabled: false },
      subscription_data: {
        metadata,
        ...(isUpfront && {
          // The subscription renews monthly *after* the prepaid period
          trial_period_days: trialMonths * 30, // ~months in days
        }),
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

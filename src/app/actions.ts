
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
    let priceId: string | undefined;
    let couponId: string | undefined;

    // 1. Prioritize specific Price ID
    const specificPriceIdEnvVar = `STRIPE_PRICE_ID_${plan.toUpperCase()}_${duration}_${currency.toUpperCase()}`;
    const specificPriceId = process.env[specificPriceIdEnvVar];

    if (specificPriceId) {
      priceId = specificPriceId;
      console.log(`Using specific Price ID: ${priceId} from env var ${specificPriceIdEnvVar}`);
    } else {
      // 2. Fallback to 1-month base price + coupon
      const basePriceIdEnvVar = `STRIPE_PRICE_ID_${plan.toUpperCase()}_1_${currency.toUpperCase()}`;
      priceId = process.env[basePriceIdEnvVar];
      
      if (!priceId) {
        throw new Error(`Base price ID for plan '${plan}' is not configured. (Expected ${basePriceIdEnvVar})`);
      }

      if (duration !== '1') {
        const couponMap: Record<Duration, string | undefined> = {
          '1': undefined,
          '12': process.env.STRIPE_COUPON_20_OFF,
          '24': process.env.STRIPE_COUPON_30_OFF,
          '48': process.env.STRIPE_COUPON_40_OFF,
        };
        couponId = couponMap[duration];
        console.log(`Using base Price ID: ${priceId} with coupon for duration ${duration}`);
        if (!couponId) {
            console.warn(`Coupon for duration '${duration}' is not configured. Proceeding without discount.`);
        }
      } else {
        console.log(`Using base Price ID: ${priceId} for 1 month duration.`);
      }
    }
    
    if (!priceId) {
      throw new Error(`Could not determine a Price ID for plan '${plan}', duration '${duration}', currency '${currency.toUpperCase()}'.`);
    }

    const returnUrl = returnPath
      ? `${baseUrl}${returnPath}`
      : `${baseUrl}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      discounts: couponId ? [{ coupon: couponId }] : [],
      ui_mode: 'embedded',
      return_url: returnUrl,
      metadata,
      subscription_data: {
        metadata,
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

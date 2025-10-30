
'use server';

import type { Issue, Plan, ProductionLine, Role, User } from '@/lib/types';
import { handleFirestoreError } from '@/lib/firestore-helpers';
import { sendEmail } from '@/lib/email';
import Stripe from 'stripe';
import { db as dbFn } from '@/firebase/server';
import { adminAuth } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
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
    getAllUsers
} from '@/lib/server-actions';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getClientInstances } from "@/firebase/client"; 

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
    getAllUsers
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

  if (userData?.stripeCustomerId) {
    try {
      const stripeCustomer = await stripe.customers.retrieve(userData.stripeCustomerId);
      if (stripeCustomer && !stripeCustomer.deleted) {
        return { id: stripeCustomer.id };
      }
    } catch {
      console.warn(`Stripe customer ID ${userData.stripeCustomerId} not found. Checking by email.`);
    }
  }

  const existingCustomers = await stripe.customers.list({ email, limit: 1 });
  if (existingCustomers.data.length > 0 && existingCustomers.data[0]) {
    const customer = existingCustomers.data[0];
    await userRef.update({ stripeCustomerId: customer.id });
    return { id: customer.id };
  }

  const newCustomer = await stripe.customers.create({ email, metadata: { userId } });
  await userRef.update({ stripeCustomerId: newCustomer.id });
  return { id: newCustomer.id };
}

// ... (keep your user, issue, production line, and email functions unchanged) ...

// ---------------- Stripe Checkout ----------------

type Duration = '1' | '12' | '24' | '48';
type Currency = 'usd' | 'eur' | 'gbp';

const priceIdMap: Record<Exclude<Plan, 'starter' | 'custom'>, Record<Duration, Record<Currency, string | undefined>>> = {
  standard: {
    '1': {
      usd: process.env.STRIPE_PRICE_ID_STANDARD_1_USD,
      eur: process.env.STRIPE_PRICE_ID_STANDARD_1_EUR,
      gbp: process.env.STRIPE_PRICE_ID_STANDARD_1_GBP,
    },
    '12': {
      usd: process.env.STRIPE_PRICE_ID_STANDARD_12_USD,
      eur: process.env.STRIPE_PRICE_ID_STANDARD_12_EUR,
      gbp: process.env.STRIPE_PRICE_ID_STANDARD_12_GBP,
    },
    '24': {
      usd: process.env.STRIPE_PRICE_ID_STANDARD_24_USD,
      eur: process.env.STRIPE_PRICE_ID_STANDARD_24_EUR,
      gbp: process.env.STRIPE_PRICE_ID_STANDARD_24_GBP,
    },
    '48': {
      usd: process.env.STRIPE_PRICE_ID_STANDARD_48_USD,
      eur: process.env.STRIPE_PRICE_ID_STANDARD_48_EUR,
      gbp: process.env.STRIPE_PRICE_ID_STANDARD_48_GBP,
    },
  },
  pro: {
    '1': {
      usd: process.env.STRIPE_PRICE_ID_PRO_1_USD,
      eur: process.env.STRIPE_PRICE_ID_PRO_1_EUR,
      gbp: process.env.STRIPE_PRICE_ID_PRO_1_GBP,
    },
    '12': {
      usd: process.env.STRIPE_PRICE_ID_PRO_12_USD,
      eur: process.env.STRIPE_PRICE_ID_PRO_12_EUR,
      gbp: process.env.STRIPE_PRICE_ID_PRO_12_GBP,
    },
    '24': {
      usd: process.env.STRIPE_PRICE_ID_PRO_24_USD,
      eur: process.env.STRIPE_PRICE_ID_PRO_24_EUR,
      gbp: process.env.STRIPE_PRICE_ID_PRO_24_GBP,
    },
    '48': {
      usd: process.env.STRIPE_PRICE_ID_PRO_48_USD,
      eur: process.env.STRIPE_PRICE_ID_PRO_48_EUR,
      gbp: process.env.STRIPE_PRICE_ID_PRO_48_GBP,
    },
  },
  enterprise: {
    '1': {
      usd: process.env.STRIPE_PRICE_ID_ENTERPRISE_1_USD,
      eur: process.env.STRIPE_PRICE_ID_ENTERPRISE_1_EUR,
      gbp: process.env.STRIPE_PRICE_ID_ENTERPRISE_1_GBP,
    },
    '12': {
      usd: process.env.STRIPE_PRICE_ID_ENTERPRISE_12_USD,
      eur: process.env.STRIPE_PRICE_ID_ENTERPRISE_12_EUR,
      gbp: process.env.STRIPE_PRICE_ID_ENTERPRISE_12_GBP,
    },
    '24': {
      usd: process.env.STRIPE_PRICE_ID_ENTERPRISE_24_USD,
      eur: process.env.STRIPE_PRICE_ID_ENTERPRISE_24_EUR,
      gbp: process.env.STRIPE_PRICE_ID_ENTERPRISE_24_GBP,
    },
    '48': {
      usd: process.env.STRIPE_PRICE_ID_ENTERPRISE_48_USD,
      eur: process.env.STRIPE_PRICE_ID_ENTERPRISE_48_EUR,
      gbp: process.env.STRIPE_PRICE_ID_ENTERPRISE_48_GBP,
    },
  },
};

// 🧾 Coupon placeholders
const COUPON_MAP: Record<'12' | '24' | '48', string | undefined> = {
  '12': process.env.STRIPE_COUPON_ID_12_MONTHS,
  '24': process.env.STRIPE_COUPON_ID_24_MONTHS,
  '48': process.env.STRIPE_COUPON_ID_48_MONTHS,
};

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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://andonpro.com';
    const priceId = (plan !== 'starter' && plan !== 'custom' && priceIdMap[plan])
      ? priceIdMap[plan][duration][currency]
      : undefined;

    if (!priceId) throw new Error('❌ Price ID not found for selected plan, duration, or currency.');

    // Always subscription mode
    const mode: Stripe.Checkout.SessionCreateParams.Mode = 'subscription';

    // Apply coupon if applicable
    const discounts =
      duration === '12' || duration === '24' || duration === '48'
        ? [{ coupon: COUPON_MAP[duration]! }]
        : undefined;

    const returnUrl = returnPath
      ? `${baseUrl}${returnPath}`
      : `${baseUrl}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`;

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
      },
      discounts,
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


export async function requestPasswordReset(email: string) {
  const { app } = getClientInstances();
  const auth = getAuth(app);

  try {
    await sendPasswordResetEmail(auth, email);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true, message: "If an account exists for this email, a password reset link has been sent." };
  } catch (error: any) {
    console.error("❌ Error sending password reset email:", error);
    // To prevent email enumeration, we always return a generic success message.
    return { success: true, message: "If an account exists for this email, a password reset link has been sent." };
  }
}


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
    reportIssue,
    updateIssue,
    getProductionLines,
    createProductionLine,
    editProductionLine,
    deleteProductionLine,
    getAllUsers,
    requestPasswordReset,
    cancelSubscription,
} from '@/lib/server-actions';


export {
    getUserByEmail,
    getUserById,
    addUser,
    editUser,
    deleteUser,
    updateUserPlan,
    sendPasswordChangedEmail,
    reportIssue,
    updateIssue,
    getProductionLines,
    createProductionLine,
    editProductionLine,
    deleteProductionLine,
    getAllUsers,
    requestPasswordReset,
    cancelSubscription,
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

export async function getPriceDetails(priceId: string) {
    try {
        if (!priceId) {
            return null;
        }
        const price = await stripe.prices.retrieve(priceId);
        const product = await stripe.products.retrieve(price.product as string);

        return {
            price: (price.unit_amount || 0) / 100,
            currency: price.currency,
            plan: product.metadata.plan,
            duration: product.metadata.duration,
        }
    } catch (error) {
        console.error("Error fetching price details from Stripe:", error);
        return null;
    }
}


export async function createCheckoutSession({
  customerId,
  priceId,
  metadata = {},
  returnPath,
}: {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
  returnPath?: string;
}) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://andonpro.com';
    
    if (!priceId) {
      throw new Error(`Price ID is missing. Cannot create a checkout session without a price ID.`);
    }

    const price = await stripe.prices.retrieve(priceId);
    if (!price) {
        throw new Error(`Price with ID ${priceId} not found.`);
    }

    const product = await stripe.products.retrieve(price.product as string);
    const duration = product.metadata.duration;

    const couponMap: Record<string, string | undefined> = {
        '1': undefined,
        '12': process.env.STRIPE_COUPON_20_OFF,
        '24': process.env.STRIPE_COUPON_30_OFF,
        '48': process.env.STRIPE_COUPON_40_OFF,
    };
    const couponId = couponMap[duration];

    if (duration !== '1' && !couponId) {
        console.warn(`Coupon for duration '${duration}' is not configured. Proceeding without discount.`);
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
      automatic_tax: {
        enabled: true,
      },
      customer_update: {
        address: 'auto'
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

export async function sendContactEmail({ name, email, message }: { name: string; email: string; message: string; }) {
    const supportEmail = 'support@andonpro.com';
    const emailHtmlToSupport = `
        <p>You have received a new contact form submission from:</p>
        <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
        </ul>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
    `;

    const emailHtmlToUser = `
        <p>Hello ${name},</p>
        <p>Thank you for contacting AndonPro. We have received your message and will get back to you as soon as possible.</p>
        <p>Here is a copy of your message:</p>
        <blockquote style="border-left: 2px solid #ccc; padding-left: 1rem; margin-left: 1rem; font-style: italic;">
            ${message}
        </blockquote>
        <p>Best regards,<br/>The AndonPro Team</p>
    `;

    try {
        // Send email to support
        await sendEmail({
            to: supportEmail,
            subject: `New Contact Form Submission from ${name}`,
            html: emailHtmlToSupport,
        });

        // Send confirmation email to user
        await sendEmail({
            to: email,
            subject: 'Thank You for Contacting AndonPro',
            html: emailHtmlToUser,
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to send contact email:', error);
        return { success: false, error: 'Failed to send your message. Please try again later.' };
    }
}
    

    

    

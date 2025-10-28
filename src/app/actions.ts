
'use server';

import type { Plan } from '@/lib/types';
import Stripe from 'stripe';
export * from '@/lib/server-actions';


// ---------------- Stripe Actions ----------------

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// A robust mapping of plan and duration to specific Stripe Price IDs
const priceIdMap: Record<Exclude<Plan, 'starter' | 'custom'>, Record<'1' | '12' | '24' | '48', string | undefined>> = {
  standard: {
    '1': process.env.STRIPE_PRICE_ID_STANDARD,
    '12': process.env.STRIPE_PRICE_ID_STANDARD_12,
    '24': process.env.STRIPE_PRICE_ID_STANDARD_24,
    '48': process.env.STRIPE_PRICE_ID_STANDARD_48,
  },
  pro: {
    '1': process.env.STRIPE_PRICE_ID_PRO,
    '12': process.env.STRIPE_PRICE_ID_PRO_12,
    '24': process.env.STRIPE_PRICE_ID_PRO_24,
    '48': process.env.STRIPE_PRICE_ID_PRO_48,
  },
  enterprise: {
    '1': process.env.STRIPE_PRICE_ID_ENTERPRISE,
    '12': process.env.STRIPE_PRICE_ID_ENTERPRISE_12,
    '24': process.env.STRIPE_PRICE_ID_ENTERPRISE_24,
    '48': process.env.STRIPE_PRICE_ID_ENTERPRISE_48,
  },
};


export async function createCheckoutSession({
  customerId,
  plan,
  duration,
  currency,
  metadata,
  returnPath,
}: {
  customerId: string;
  plan: Plan;
  duration: '1' | '12' | '24' | '48';
  currency: 'usd' | 'eur' | 'gbp';
  metadata?: Record<string, string>;
  returnPath?: string;
}) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://localhost:3000';
    
    // Safely look up the price ID using plan and duration
    const priceId = (plan !== 'starter' && plan !== 'custom' && priceIdMap[plan])
      ? priceIdMap[plan][duration]
      : undefined;

    if (!priceId) throw new Error('❌ Price ID not found for selected plan or duration.');
    
    const mode = duration === '1' ? 'subscription' : 'payment';
    
    // Use the provided return path or default to the dashboard with a success flag
    const finalReturnUrl = returnPath 
      ? `https://andonpro.com${returnPath}`
      : `https://andonpro.com/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      currency,
      ui_mode: 'embedded',
      return_url: finalReturnUrl,
      metadata,
    };

    if (mode === 'subscription') {
      sessionParams.subscription_data = { metadata };
    } else if (mode === 'payment') {
      sessionParams.payment_intent_data = { metadata };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('✅ Stripe session created:', session.id);
    return { clientSecret: session.client_secret };
  } catch (error: any) {
    console.error('❌ Stripe session error:', error);
    throw new Error(error.message || 'Failed to create Stripe checkout session.');
  }
}


'use server';
/**
 * @fileOverview A flow to create a Stripe checkout session for a given plan.
 *
 * - createCheckoutSession - Creates a Stripe checkout session.
 * - CreateCheckoutSessionInput - The input type for the function.
 * - CreateCheckoutSessionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Stripe from 'stripe';
import type { Plan } from '@/lib/types';

const CreateCheckoutSessionInputSchema = z.object({
  plan: z.enum(['starter', 'standard', 'pro', 'enterprise', 'custom']),
  email: z.string().email(),
  userId: z.string(),
});
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionInputSchema>;

const CreateCheckoutSessionOutputSchema = z.object({
  clientSecret: z.string(),
});
export type CreateCheckoutSessionOutput = z.infer<typeof CreateCheckoutSessionOutputSchema>;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-06-20',
});

// Map your app's plans to Stripe Price IDs from environment variables
const priceIds: Record<Plan, string> = {
    starter: '', // No price for starter
    standard: process.env.STRIPE_PRICE_ID_STANDARD || '',
    pro: process.env.STRIPE_PRICE_ID_PRO || '',
    enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
    custom: '', // Custom plans are handled via manual invoicing
};


export const createCheckoutSession = ai.defineFlow(
  {
    name: 'createCheckoutSession',
    inputSchema: CreateCheckoutSessionInputSchema,
    outputSchema: CreateCheckoutSessionOutputSchema,
  },
  async ({ plan, email, userId }) => {
    if (plan === 'starter' || plan === 'custom') {
        throw new Error('This plan does not require automated payment.');
    }

    const priceId = priceIds[plan];
    if (!priceId) {
        throw new Error(`Price ID for plan "${plan}" is not configured. Please check your environment variables.`);
    }

    // Check if a customer with this email or userId already exists
    let customer;
    const existingCustomers = await stripe.customers.list({ email: email, limit: 1 });
    
    if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
    } else {
        customer = await stripe.customers.create({
            email: email,
            metadata: { userId: userId },
        });
    }

    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
    });

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;
    
    if (!paymentIntent || !paymentIntent.client_secret) {
        throw new Error('Could not create payment intent.');
    }
    
    return {
        clientSecret: paymentIntent.client_secret,
    };
  }
);

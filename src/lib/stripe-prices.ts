
import type { Currency, Plan } from "@/lib/types";

// Helper function to get price ID from environment variables
const getPriceId = (plan: Plan, currency: Currency): string => {
  if (plan === 'starter' || plan === 'custom') return '';
  const envVarName = `STRIPE_PRICE_ID_${plan.toUpperCase()}_1_${currency.toUpperCase()}`;
  const priceId = process.env[envVarName];
  if (!priceId) {
    console.warn(`Stripe Price ID not found for env var: ${envVarName}`);
    return '';
  }
  return priceId;
};

export const planToPriceId: Record<Exclude<Plan, 'starter' | 'custom'>, Record<Currency, string>> = {
  standard: {
    eur: getPriceId('standard', 'eur'),
    usd: getPriceId('standard', 'usd'),
    gbp: getPriceId('standard', 'gbp'),
  },
  pro: {
    eur: getPriceId('pro', 'eur'),
    usd: getPriceId('pro', 'usd'),
    gbp: getPriceId('pro', 'gbp'),
  },
  enterprise: {
    eur: getPriceId('enterprise', 'eur'),
    usd: getPriceId('enterprise', 'usd'),
    gbp: getPriceId('enterprise', 'gbp'),
  },
};

// ✅ Reverse map (for webhook lookups)
export const priceIdToPlan: Record<string, Plan> = Object.fromEntries(
  Object.entries(planToPriceId).flatMap(([plan, currencies]) =>
    Object.values(currencies).map(priceId => [priceId, plan as Plan])
  ).filter(([priceId]) => priceId) // Filter out empty price IDs
);

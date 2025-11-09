
import type { Plan } from "./types";

// ============================================================================
// IMPORTANT: Stripe Price ID to Plan Mapping
// ============================================================================
// This object maps your Stripe Price IDs to the internal plan names used in
// your application (e.g., 'standard', 'pro'). When the webhook receives a
// successful payment, it uses this map to determine which plan the user
// purchased.
//
// How to use:
// 1. Go to your Stripe Dashboard -> Products.
// 2. Click on a product (e.g., "AndonPro Standard").
// 3. In the "Pricing" section, you will see one or more prices.
// 4. Click on a price to view its details.
// 5. Copy the "ID" (it will look like `price_1P...`).
// 6. Paste the ID here as a key, and set its value to the corresponding plan name.
//
// You must add an entry for EVERY price you have created in Stripe.
// ============================================================================

export const priceIdToPlan: Record<string, Plan> = {
  // --- Standard Plan ---
  // Example for Standard - Monthly - USD
  'price_...': 'standard', 
  // Example for Standard - Monthly - EUR
  'price_...': 'standard',
  
  // --- Pro Plan ---
  // Example for Pro - Monthly - USD
  'price_...': 'pro', 
  // Example for Pro - Monthly - EUR
  'price_...': 'pro',

  // --- Enterprise Plan ---
  // Example for Enterprise - Monthly - USD
  'price_...': 'enterprise', 
  // Example for Enterprise - Monthly - EUR
  'price_...': 'enterprise',

  // ... add all other price IDs for all currencies and durations here
};

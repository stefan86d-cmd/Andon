
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
  'price_1SPNLkCKFYqU3RzmZhRSbLM9': 'standard', // 1M USD
  'price_1SPNA1CKFYqU3Rzm2XZEmQFR': 'standard', // 1M EUR
  'price_1SPNPJCKFYqU3Rzm5KFKS4l9': 'standard', // 1M GBP
  'price_1SQo81CKFYqU3RzmLSLz1fA0': 'standard', // 12M USD
  'price_1SQo99CKFYqU3RzmMmClbB2S': 'standard', // 12M EUR
  'price_1SQo9yCKFYqU3Rzm981T687S': 'standard', // 12M GBP
  'price_1SQoAmCKFYqU3RzmjJ4q6zRk': 'standard', // 24M USD
  'price_1SQoBPCKFYqU3Rzm8p1vXvMs': 'standard', // 24M EUR
  'price_1SQoCQCKFYqU3RzmKy15zAWi': 'standard', // 24M GBP
  'price_1SQoDWCKFYqU3RzmnO7nJ3uK': 'standard', // 48M USD
  'price_1SQoEBCKFYqU3RzmxvNqXqHl': 'standard', // 48M EUR
  'price_1SQoFBCKFYqU3Rzm2QzLq4e9': 'standard', // 48M GBP

  // --- Pro Plan ---
  'price_1SPNMSCKFYqU3Rzm6COoQBOC': 'pro', // 1M USD
  'price_1SPNBbCKFYqU3RzmrE3IRkyz': 'pro', // 1M EUR
  'price_1SPNQ1CKFYqU3RzmjiwhweIL': 'pro', // 1M GBP
  'price_1SQoG2CKFYqU3RzmzVbN2ZcI': 'pro', // 12M USD
  'price_1SQoGZCKFYqU3Rzm89a2s9w2': 'pro', // 12M EUR
  'price_1SQoHOCKFYqU3RzmVfg29bU9': 'pro', // 12M GBP
  'price_1SQoICKFYqU3RzmaJ3M2XFk': 'pro', // 24M USD
  'price_1SQoIqCKFYqU3Rzm4r5hEw2H': 'pro', // 24M EUR
  'price_1SQoJfCKFYqU3Rzm2bW3S1nN': 'pro', // 24M GBP
  'price_1SQoKPCKFYqU3Rzm0tS7vG1S': 'pro', // 48M USD
  'price_1SQoL5CKFYqU3Rzm1Lg4E3yH': 'pro', // 48M EUR
  'price_1SQoLnCKFYqU3RzmI8B4QW3P': 'pro', // 48M GBP

  // --- Enterprise Plan ---
  'price_1SPNNRCKFYqU3RzmJLR5wDnF': 'enterprise', // 1M USD
  'price_1SPNCdCKFYqU3RzmOsFnGBky': 'enterprise', // 1M EUR
  'price_1SQoMYCKFYqU3RzmpzctK1XO': 'enterprise', // 1M GBP
  'price_1SQoNECKFYqU3Rzm3wUaUa2g': 'enterprise', // 12M USD
  'price_1SQoNtCKFYqU3RzmFvI02ZVi': 'enterprise', // 12M EUR
  'price_1SQoOfCKFYqU3Rzmx8O6Qx6L': 'enterprise', // 12M GBP
  'price_1SQoPGCKFYqU3RzmB6YF33z1': 'enterprise', // 24M USD
  'price_1SQoQACKFYqU3RzmfuK0W7nC': 'enterprise', // 24M EUR
  'price_1SQoQsCKFYqU3RzmFhE83E4u': 'enterprise', // 24M GBP
  'price_1SQoRICKFYqU3Rzmr4L1m3cE': 'enterprise', // 48M USD
  'price_1SQoRyCKFYqU3Rzmkz8y3Q0P': 'enterprise', // 48M EUR
  'price_1SQoSWCKFYqU3RzmkcE30d4h': 'enterprise', // 48M GBP
};

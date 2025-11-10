import type { Plan } from "./types";

// ============================================================================
// Stripe Price ID to Plan Mapping
// ============================================================================
export const priceIdToPlan: Record<string, Plan> = {
  // --- Standard Plan ---
  'price_1SPNLkCKFYqU3RzmZhRSbLM9': 'standard', // USD
  'price_1SPNA1CKFYqU3Rzm2XZEmQFR': 'standard', // EUR
  'price_1SPNPJCKFYqU3Rzm5KFKS4l9': 'standard', // GBP
  
  // --- Pro Plan ---
  'price_1SPNMSCKFYqU3Rzm6COoQBOC': 'pro', // USD
  'price_1SPNBbCKFYqU3RzmrE3IRkyz': 'pro', // EUR
  'price_1SPNQ1CKFYqU3RzmjiwhweIL': 'pro', // GBP

  // --- Enterprise Plan ---
  'price_1SPNNRCKFYqU3RzmJLR5wDnF': 'enterprise', // USD
  'price_1SPNCdCKFYqU3RzmOsFnGBky': 'enterprise', // EUR
  'price_1SQoMYCKFYqU3RzmpzctK1XO': 'enterprise', // GBP
};

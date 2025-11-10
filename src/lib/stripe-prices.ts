import type { Currency } from "@/lib/types";

// Define your supported currencies and plans
export type Plan = "standard" | "pro" | "enterprise";

export const planToPriceId: Record<Plan, Record<Currency, string>> = {
  standard: {
    eur: "price_1SPNA1CKFYqU3Rzm2XZEmQFR",
    usd: "price_1SPNLkCKFYqU3RzmZhRSbLM9",
    gbp: "price_1SPNPJCKFYqU3Rzm5KFKS4l9",
  },
  pro: {
    eur: "price_1SPNBbCKFYqU3RzmrE3IRkyz",
    usd: "price_1SPNMSCKFYqU3Rzm6COoQBOC",
    gbp: "price_1SPNQ1CKFYqU3RzmjiwhweIL",
  },
  enterprise: {
    eur: "price_1SPNCdCKFYqU3RzmOsFnGBky",
    usd: "price_1SPNNRCKFYqU3RzmJLR5wDnF",
    gbp: "price_1SQoMYCKFYqU3RzmpzctK1XO",
  },
};

// ✅ Reverse map (for webhook lookups)
export const priceIdToPlan: Record<string, Plan> = Object.fromEntries(
  Object.entries(planToPriceId).flatMap(([plan, currencies]) =>
    Object.entries(currencies).map(([currency, priceId]) => [priceId, plan as Plan])
  )
);


import type { Currency } from './types';

// ✅ Stripe-hosted payment links
export const stripePayLinks: Record<string, Record<Currency, string>> = {
  standard: {
    eur: "https://buy.stripe.com/7sY14mdM48fI6R2aSG",
    usd: "https://buy.stripe.com/4gM28q7nG9jM0sEdR1",
    gbp: "https://buy.stripe.com/bJe6oGgYggMea3e8wy",
  },
  pro: {
    eur: "https://buy.stripe.com/eVa28q8rK53wejudR4",
    usd: "https://buy.stripe.com/5kQdR8azS3Zseju4gh",
    gbp: "https://buy.stripe.com/28E00i8rK8fIfnybIS",
  },
  enterprise: {
    eur: "https://buy.stripe.com/28EdR8azSfIa4IUf8u",
    usd: "https://buy.stripe.com/4gM7sK8rKfIaeju0eC",
    gbp: "https://buy.stripe.com/5kQ7sK37qanQ3EQ4gi",
  },
};

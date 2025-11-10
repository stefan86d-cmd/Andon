"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Currency = "usd" | "eur" | "gbp";

interface Tier {
  id: "standard" | "pro" | "enterprise" | "starter";
  name: string;
  price: { [key in Currency]: number };
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const stripePayLinks: Record<string, Record<Currency, string>> = {
  standard: {
    eur: "https://buy.stripe.com/7sY14mdM48fI6R2aSG0Ny08",
    usd: "https://buy.stripe.com/4gM28q7nG9jM0sEd0O0Ny05",
    gbp: "https://buy.stripe.com/bJe6oGgYggMea3e8Ky0Ny02",
  },
  pro: {
    eur: "https://buy.stripe.com/eVq28q8rK53wejud0O0Ny07",
    usd: "https://buy.stripe.com/5kQdR8azS3Zseju4ui0Ny04",
    gbp: "https://buy.stripe.com/28E00i8rK8fIfnye4S0Ny01",
  },
  enterprise: {
    eur: "https://buy.stripe.com/28EdR8azSfIa4IUf8W0Ny06",
    usd: "https://buy.stripe.com/4gM7sK8rKfIaeju0e20Ny03",
    gbp: "https://buy.stripe.com/5kQ7sK37qanQ3EQ4ui0Ny00",
  },
};

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    price: { usd: 0, eur: 0, gbp: 0 },
    description: "Perfect for small teams or personal use.",
    features: [
      "Up to 10 active issues",
      "1 production line",
      "Basic analytics",
    ],
    cta: "Get Started Free",
  },
  {
    id: "standard",
    name: "Standard",
    price: { usd: 29, eur: 27, gbp: 24 },
    description: "Ideal for growing operations with multiple lines.",
    features: [
      "Unlimited active issues",
      "Up to 5 production lines",
      "Advanced analytics dashboard",
      "Email support",
    ],
    cta: "Subscribe",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: { usd: 59, eur: 54, gbp: 48 },
    description: "For larger teams needing deeper insights.",
    features: [
      "Unlimited active issues",
      "Unlimited production lines",
      "Custom alerts and notifications",
      "Priority support",
    ],
    cta: "Subscribe",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: { usd: 99, eur: 92, gbp: 82 },
    description: "Full customization and dedicated support.",
    features: [
      "Unlimited everything",
      "Dedicated success manager",
      "Custom integrations",
      "24/7 priority support",
    ],
    cta: "Subscribe",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8">
      <PricingPageContent />
    </div>
  );
}

function PricingPageContent() {
  const [currency, setCurrency] = useState<Currency>("usd");
  const [duration, setDuration] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency") as Currency;
    if (savedCurrency) setCurrency(savedCurrency);
  }, []);

  const handleCurrencyChange = (value: Currency) => {
    setCurrency(value);
    localStorage.setItem("selectedCurrency", value);
  };

  return (
    <div className="max-w-6xl mx-auto text-center">
      <motion.h1
        className="text-4xl font-bold mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Simple, Transparent Pricing
      </motion.h1>
      <p className="text-gray-600 mb-12">
        Choose the plan that best fits your operation.
      </p>

      {/* Currency Switcher */}
      <div className="flex justify-center gap-4 mb-12">
        {(["usd", "eur", "gbp"] as Currency[]).map((c) => (
          <Button
            key={c}
            onClick={() => handleCurrencyChange(c)}
            variant={currency === c ? "default" : "outline"}
          >
            {c.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {tiers.map((tier, index) => {
          const isStarter = tier.id === "starter";
          const planLinks = stripePayLinks[tier.id];
          let checkoutHref = "#";
          if (!isStarter && planLinks && planLinks[currency]) {
            checkoutHref = planLinks[currency];
          }

          const currencySymbol =
            currency === "usd" ? "$" : currency === "eur" ? "€" : "£";

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl border bg-white p-8 shadow-sm ${
                tier.popular ? "border-blue-500 ring-2 ring-blue-200" : ""
              }`}
            >
              {tier.popular && (
                <span className="inline-block px-3 py-1 mb-3 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                  Most Popular
                </span>
              )}

              <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
              <p className="text-gray-500 mb-6">{tier.description}</p>

              <div className="text-4xl font-bold mb-6">
                {currencySymbol}
                {tier.price[currency]}
                <span className="text-lg font-normal text-gray-500">/mo</span>
              </div>

              <ul className="text-left mb-8 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isStarter ? (
                <Link href="/register">
                  <Button className="w-full">{tier.cta}</Button>
                </Link>
              ) : (
                <a href={checkoutHref} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {tier.cta}
                  </Button>
                </a>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

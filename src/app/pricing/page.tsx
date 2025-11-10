
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/contexts/user-context";

type Currency = "usd" | "eur" | "gbp";
type Duration = "1" | "12" | "24" | "48";

interface Tier {
  id: "standard" | "pro" | "enterprise" | "starter";
  name: string;
  prices: { [key in Duration]: { [key in Currency]: number } };
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    prices: {
      "1": { usd: 0, eur: 0, gbp: 0 },
      "12": { usd: 0, eur: 0, gbp: 0 },
      "24": { usd: 0, eur: 0, gbp: 0 },
      "48": { usd: 0, eur: 0, gbp: 0 },
    },
    description: "For small teams to get started.",
    features: ["Up to 5 users", "1 production line", "Basic analytics"],
    cta: "Get Started Free",
  },
  {
    id: "standard",
    name: "Standard",
    prices: {
      "1": { usd: 39.99, eur: 36.99, gbp: 32.99 },
      "12": { usd: 31.99, eur: 29.59, gbp: 26.39 },
      "24": { usd: 27.99, eur: 25.89, gbp: 23.09 },
      "48": { usd: 23.99, eur: 22.19, gbp: 19.79 },
    },
    description: "For growing teams and factories.",
    features: [
      "Up to 80 users",
      "5 production lines",
      "Advanced analytics",
      "Email support",
    ],
    cta: "Choose Standard",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    prices: {
      "1": { usd: 59.99, eur: 54.99, gbp: 49.99 },
      "12": { usd: 47.99, eur: 43.99, gbp: 39.99 },
      "24": { usd: 41.99, eur: 38.49, gbp: 34.99 },
      "48": { usd: 35.99, eur: 32.99, gbp: 29.99 },
    },
    description: "For larger operations needing more.",
    features: [
      "Up to 150 users",
      "10 production lines",
      "Custom alerts & notifications",
      "Priority email support",
    ],
    cta: "Choose Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    prices: {
      "1": { usd: 149.99, eur: 139.99, gbp: 124.99 },
      "12": { usd: 119.99, eur: 111.99, gbp: 99.99 },
      "24": { usd: 104.99, eur: 97.99, gbp: 87.49 },
      "48": { usd: 89.99, eur: 83.99, gbp: 74.99 },
    },
    description: "For large-scale, complex needs.",
    features: [
      "Up to 400 users",
      "20 production lines",
      "Custom integrations",
      "24/7 priority support",
    ],
    cta: "Choose Enterprise",
  },
];

const guarantees = [
  {
    title: "24/7 Support",
    description: "Our support team is available around the clock to help you with any issues.",
    availability: "Available on the Enterprise plan.",
  },
  {
    title: "30-Day Money-Back Guarantee",
    description: "Not satisfied? Get a full refund within the first 30 days of your subscription.",
    availability: "",
  },
  {
    title: "Cancel Anytime",
    description: "You can cancel your subscription at any time, no questions asked.",
    availability: "",
  },
];

const currencySymbols: Record<Currency, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
};

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>("usd");
  const [duration, setDuration] = useState<Duration>("12");
  const { currentUser } = useUser();

  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency") as Currency;
    if (savedCurrency && ["usd", "eur", "gbp"].includes(savedCurrency)) {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleCurrencyChange = (value: string) => {
    const newCurrency = value as Currency;
    setCurrency(newCurrency);
    localStorage.setItem("selectedCurrency", newCurrency);
  };

  const handleDurationChange = (value: string) => {
    setDuration(value as Duration);
  };

  const getDiscountText = (d: Duration) => {
    switch (d) {
      case "12": return "Save 20%";
      case "24": return "Save 30%";
      case "48": return "Save 40%";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-muted py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h1
          className="text-4xl font-bold mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Pricing
        </motion.h1>
        <motion.p
          className="text-gray-600 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Find the right plan that exactly matches your team's needs. Start for free and scale as you grow.
        </motion.p>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
          <Select value={currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD ($)</SelectItem>
              <SelectItem value="eur">EUR (€)</SelectItem>
              <SelectItem value="gbp">GBP (£)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={duration} onValueChange={handleDurationChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Billing Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Monthly</SelectItem>
              <SelectItem value="12">12 Months (Save 20%)</SelectItem>
              <SelectItem value="24">24 Months (Save 30%)</SelectItem>
              <SelectItem value="48">48 Months (Save 40%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier, index) => {
            const isStarter = tier.id === "starter";
            const price = isStarter ? 0 : tier.prices[duration][currency];
            
            const checkoutHref = isStarter
              ? `/register?plan=starter`
              : `/checkout?plan=${tier.id}&duration=${duration}&currency=${currency}`;
            
            if (currentUser && currentUser.role && !isStarter) {
                // If user is logged in, send them to billing page to change plan
                // checkoutHref = '/settings/billing'; 
            }

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "rounded-2xl border bg-card text-card-foreground shadow-sm flex flex-col",
                  tier.popular ? "border-primary ring-2 ring-primary/20" : ""
                )}
              >
                <div className="p-8 flex-1 flex flex-col">
                  {tier.popular && (
                    <Badge
                      variant="default"
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                    >
                      Most Popular
                    </Badge>
                  )}

                  <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                  <p className="text-muted-foreground mb-6 h-10">{tier.description}</p>
                    
                  <div className="mb-6">
                    {isStarter ? (
                         <div className="text-4xl font-bold">Free</div>
                    ) : (
                        <>
                            <div className="text-4xl font-bold">
                                {currencySymbols[currency]}
                                {price.toFixed(2)}
                                <span className="text-lg font-normal text-muted-foreground">
                                /mo
                                </span>
                            </div>
                            {duration !== "1" && (
                                <div className="text-sm font-semibold text-green-600 h-5 mt-1">
                                    {getDiscountText(duration)}
                                </div>
                            )}
                        </>
                    )}
                  </div>


                  <ul className="text-left mb-8 space-y-3 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                
                 <Button asChild className="w-full mt-auto" variant={tier.id === 'enterprise' ? 'outline' : 'default'}>
                    <Link href={checkoutHref}>{tier.cta}</Link>
                </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Guarantees Section */}
        <div className="mt-24 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Our Guarantees</h2>
            <p className="text-muted-foreground mb-12">
                We stand by our product and our service. Here's what you can expect from us.
            </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {guarantees.map((guarantee) => (
                    <div key={guarantee.title}>
                        <h3 className="text-base font-semibold mb-2">{guarantee.title}</h3>
                        <p className="text-sm text-muted-foreground">{guarantee.description}</p>
                        {guarantee.availability && <p className="text-xs text-muted-foreground mt-2">{guarantee.availability}</p>}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}


    
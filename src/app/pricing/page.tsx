"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Globe, Menu } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MegaMenu } from "@/components/layout/mega-menu";
import FooterLogo from "@/components/layout/footer-logo";
import { useUser } from "@/contexts/user-context";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type Duration = "1" | "12" | "24" | "48";
type Currency = "usd" | "eur" | "gbp";

const tiers = [
  {
    name: "Starter",
    id: "starter",
    href: "/register?plan=starter",
    price: { usd: 0, eur: 0, gbp: 0 },
    pricePeriod: "",
    description: "For small teams getting started with issue tracking.",
    features: [
      "Up to 5 users",
      "1 Production Line",
      "Up to 5 workstations",
      "Basic Issue Reporting",
      "Dashboard View",
    ],
    cta: "Get Started",
  },
  {
    name: "Standard",
    id: "standard",
    prices: {
      "1": { usd: 39.99, eur: 36.99, gbp: 32.99 },
      "12": { usd: 31.99, eur: 29.59, gbp: 26.39 },
      "24": { usd: 27.99, eur: 25.89, gbp: 23.09 },
      "48": { usd: 23.99, eur: 22.19, gbp: 19.79 },
    },
    paymentLinks: {
      "1": {
        usd: "https://buy.stripe.com/4gM28q7nG9jM0sEd0O0Ny05",
        eur: "https://buy.stripe.com/7sY14mdM48fI6R2aSG0Ny08",
        gbp: "https://buy.stripe.com/bJe6oGgYggMea3e8Ky0Ny02",
      },
      "12": {
        usd: "https://buy.stripe.com/4gM28q7nG9jM0sEd0O0Ny05?prefilled_promo_code=YAPPQ2YO",
        eur: "https://buy.stripe.com/7sY14mdM48fI6R2aSG0Ny08?prefilled_promo_code=YAPPQ2YO",
        gbp: "https://buy.stripe.com/bJe6oGgYggMea3e8Ky0Ny02?prefilled_promo_code=YAPPQ2YO",
      },
      "24": {
        usd: "https://buy.stripe.com/4gM28q7nG9jM0sEd0O0Ny05?prefilled_promo_code=TQ4IVSRD",
        eur: "https://buy.stripe.com/7sY14mdM48fI6R2aSG0Ny08?prefilled_promo_code=TQ4IVSRD",
        gbp: "https://buy.stripe.com/bJe6oGgYggMea3e8Ky0Ny02?prefilled_promo_code=TQ4IVSRD",
      },
      "48": {
        usd: "https://buy.stripe.com/4gM28q7nG9jM0sEd0O0Ny05?prefilled_promo_code=ALRLAVQ8",
        eur: "https://buy.stripe.com/7sY14mdM48fI6R2aSG0Ny08?prefilled_promo_code=ALRLAVQ8",
        gbp: "https://buy.stripe.com/bJe6oGgYggMea3e8Ky0Ny02?prefilled_promo_code=ALRLAVQ8",
      },
    },
    pricePeriod: "/ month",
    description: "For growing factories that need more power and insights.",
    features: [
      "Up to 80 users",
      "Up to 5 Production Lines",
      "Up to 10 workstations per line",
      "Advanced Reporting & Analytics",
      "User Role Management",
    ],
    cta: "Choose Plan",
    badge: "Most popular",
    popular: true,
  },
  {
    name: "Pro",
    id: "pro",
    prices: {
      "1": { usd: 59.99, eur: 54.99, gbp: 49.99 },
      "12": { usd: 47.99, eur: 43.99, gbp: 39.99 },
      "24": { usd: 41.99, eur: 38.49, gbp: 34.99 },
      "48": { usd: 35.99, eur: 32.99, gbp: 29.99 },
    },
    paymentLinks: {
      "1": {
        usd: "https://buy.stripe.com/5kQdR8azS3Zseju4ui0Ny04",
        eur: "https://buy.stripe.com/eVq28q8rK53wejud0O0Ny07",
        gbp: "https://buy.stripe.com/28E00i8rK8fIfnye4S0Ny01",
      },
      "12": {
        usd: "https://buy.stripe.com/5kQdR8azS3Zseju4ui0Ny04?prefilled_promo_code=YAPPQ2YO",
        eur: "https://buy.stripe.com/eVq28q8rK53wejud0O0Ny07?prefilled_promo_code=YAPPQ2YO",
        gbp: "https://buy.stripe.com/28E00i8rK8fIfnye4S0Ny01?prefilled_promo_code=YAPPQ2YO",
      },
      "24": {
        usd: "https://buy.stripe.com/5kQdR8azS3Zseju4ui0Ny04?prefilled_promo_code=TQ4IVSRD",
        eur: "https://buy.stripe.com/eVq28q8rK53wejud0O0Ny07?prefilled_promo_code=TQ4IVSRD",
        gbp: "https://buy.stripe.com/28E00i8rK8fIfnye4S0Ny01?prefilled_promo_code=TQ4IVSRD",
      },
      "48": {
        usd: "https://buy.stripe.com/5kQdR8azS3Zseju4ui0Ny04?prefilled_promo_code=ALRLAVQ8",
        eur: "https://buy.stripe.com/eVq28q8rK53wejud0O0Ny07?prefilled_promo_code=ALRLAVQ8",
        gbp: "https://buy.stripe.com/28E00i8rK8fIfnye4S0Ny01?prefilled_promo_code=ALRLAVQ8",
      },
    },
    pricePeriod: "/ month",
    description: "For scaling operations with expanded needs.",
    features: [
      "Up to 150 users",
      "Up to 10 Production Lines",
      "Up to 15 workstations per line",
      "Advanced Reporting & Analytics",
      "User Role Management",
      "Priority Support",
    ],
    cta: "Choose Plan",
    badge: "Best Value",
    popular: true,
    badgeVariant: "destructive" as "destructive",
  },
  {
    name: "Enterprise",
    id: "enterprise",
    prices: {
      "1": { usd: 149.99, eur: 139.99, gbp: 124.99 },
      "12": { usd: 119.99, eur: 111.99, gbp: 99.99 },
      "24": { usd: 104.99, eur: 97.99, gbp: 87.49 },
      "48": { usd: 89.99, eur: 83.99, gbp: 74.99 },
    },
    paymentLinks: {
      "1": {
        usd: "https://buy.stripe.com/4gM7sK8rKfIaeju0e20Ny03",
        eur: "https://buy.stripe.com/28EdR8azSfIa4IUf8W0Ny06",
        gbp: "https://buy.stripe.com/5kQ7sK37qanQ3EQ4ui0Ny00",
      },
      "12": {
        usd: "https://buy.stripe.com/4gM7sK8rKfIaeju0e20Ny03?prefilled_promo_code=YAPPQ2YO",
        eur: "https://buy.stripe.com/28EdR8azSfIa4IUf8W0Ny06?prefilled_promo_code=YAPPQ2YO",
        gbp: "https://buy.stripe.com/5kQ7sK37qanQ3EQ4ui0Ny00?prefilled_promo_code=YAPPQ2YO",
      },
      "24": {
        usd: "https://buy.stripe.com/4gM7sK8rKfIaeju0e20Ny03?prefilled_promo_code=TQ4IVSRD",
        eur: "https://buy.stripe.com/28EdR8azSfIa4IUf8W0Ny06?prefilled_promo_code=TQ4IVSRD",
        gbp: "https://buy.stripe.com/5kQ7sK37qanQ3EQ4ui0Ny00?prefilled_promo_code=TQ4IVSRD",
      },
      "48": {
        usd: "https://buy.stripe.com/4gM7sK8rKfIaeju0e20Ny03?prefilled_promo_code=ALRLAVQ8",
        eur: "https://buy.stripe.com/28EdR8azSfIa4IUf8W0Ny06?prefilled_promo_code=ALRLAVQ8",
        gbp: "https://buy.stripe.com/5kQ7sK37qanQ3EQ4ui0Ny00?prefilled_promo_code=ALRLAVQ8",
      },
    },
    pricePeriod: "/ month",
    description: "For large-scale operations with expanded resources.",
    features: [
      "Up to 400 users",
      "20 Production Lines",
      "Up to 20 workstations per line",
      "User Role Management",
      "Advanced Reporting & Analytics",
      "24/7 Priority Support",
    ],
    cta: "Choose Plan",
    badge: "Premium",
    premium: true,
  },
];

export default function PricingPage() {
  const [duration, setDuration] = useState<Duration>("12");
  const [currency, setCurrency] = useState<Currency>("usd");
  const { currentUser } = useUser();
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const currencySymbols = { usd: "$", eur: "€", gbp: "£" };
  const formatPrice = (price: number, currency: Currency) => {
    const locale = { usd: "en-US", eur: "de-DE", gbp: "en-GB" }[currency];
    return price.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="py-20 border-t bg-background">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {tiers.map((tier) => {
                const isStarter = tier.name === "Starter";
                const priceInfo = !isStarter
                  ? tier.prices?.[duration]?.[currency] ?? 0
                  : 0;
                const fullPriceInfo = !isStarter
                  ? tier.prices?.["1"]?.[currency] ?? 0
                  : 0;
                const paymentLink = !isStarter
                  ? tier.paymentLinks?.[duration]?.[currency] ?? "#"
                  : "#";

                const registrationHref = `/register?plan=${tier.id}&duration=${duration}&currency=${currency}`;
                const finalHref = currentUser
                  ? `${paymentLink}?client_reference_id=${currentUser.orgId}&prefilled_email=${currentUser.email}`
                  : registrationHref;

                const isProBestValue = tier.name === "Pro";

                return (
                  <div key={tier.name} className="relative">
                    {tier.badge && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                        <Badge
                          variant={
                            tier.badgeVariant ||
                            (tier.premium ? "secondary" : "default")
                          }
                          className={cn(
                            "text-sm",
                            tier.premium &&
                              "text-foreground border-border"
                          )}
                        >
                          {tier.badge}
                        </Badge>
                      </div>
                    )}
                    <Card
                      className={cn(
                        "flex flex-col h-full relative overflow-hidden",
                        tier.popular &&
                          (isProBestValue
                            ? "border-destructive shadow-lg"
                            : "border-primary shadow-lg"),
                        tier.premium &&
                          "border-2 border-gray-300 dark:border-gray-700 shadow-lg"
                      )}
                    >
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl pt-4">
                          {tier.name}
                        </CardTitle>
                        <div className="flex items-baseline justify-center gap-1 h-10">
                          <span className="text-4xl font-bold">
                            {isStarter
                              ? "Free"
                              : `${currencySymbols[currency]}${formatPrice(
                                  priceInfo,
                                  currency
                                )}`}
                          </span>
                          {tier.pricePeriod && !isStarter && (
                            <span className="text-muted-foreground">
                              {tier.pricePeriod}
                            </span>
                          )}
                        </div>
                        <CardDescription>{tier.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <ul className="space-y-4">
                          {tier.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-center"
                            >
                              <Badge
                                variant="outline"
                                className="border-0 font-medium text-green-600"
                              >
                                <CheckCircle className="h-5 w-5 mr-2" />
                                <span>{feature}</span>
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter className="flex-col items-stretch">
                        <Link
                          href={finalHref}
                          className={cn(
                            buttonVariants({
                              variant: isProBestValue
                                ? "destructive"
                                : tier.popular
                                ? "default"
                                : "outline",
                            }),
                            "w-full"
                          )}
                        >
                          {tier.cta}
                        </Link>
                        {!isStarter && fullPriceInfo && (
                          <p className="text-xs text-muted-foreground mt-3 text-center">
                            Billed monthly. Renews at{" "}
                            {currencySymbols[currency]}
                            {formatPrice(fullPriceInfo, currency)}/mo after the
                            first {duration} months.
                          </p>
                        )}
                        {isStarter && (
                          <p className="text-xs text-muted-foreground mt-3 text-center h-8">
                            No credit card required.
                          </p>
                        )}
                      </CardFooter>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

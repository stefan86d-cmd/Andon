"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
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
  const { currentUser } = useUser();

  const handleCurrencyChange = (value: Currency) => {
    setCurrency(value);
    localStorage.setItem("selectedCurrency", value);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <div className="flex items-center md:mr-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden mr-2">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="pr-0">
                        <VisuallyHidden>
                            <SheetTitle>Mobile Navigation Menu</SheetTitle>
                        </VisuallyHidden>
                        <div className="flex flex-col space-y-4">
                            <Link href="/" className="mr-6 flex items-center space-x-2">
                                <Logo />
                            </Link>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="services">
                                    <AccordionTrigger>Services</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col pl-4">
                                            {servicesMenuItems.map(item => <MobileNavLink key={item.href} href={item.href}>{item.title}</MobileNavLink>)}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="explore">
                                    <AccordionTrigger>Explore</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col pl-4">
                                            {exploreMenuItems.map(item => <MobileNavLink key={item.href} href={item.href}>{item.title}</MobileNavLink>)}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="support">
                                    <AccordionTrigger>Support</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col pl-4">
                                            {supportMenuItems.map(item => <MobileNavLink key={item.href} href={item.href}>{item.title}</MobileNavLink>)}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </SheetContent>
                </Sheet>
                <Link href="/" className="flex items-center space-x-2">
                    <Logo />
                </Link>
                <nav className="hidden md:flex items-center space-x-1 text-sm ml-6">
                    <MegaMenu 
                        triggerText="Services" 
                        items={servicesMenuItems}
                        image={servicesImage}
                    />
                    <MegaMenu 
                        triggerText="Explore" 
                        items={exploreMenuItems}
                        image={exploreImage}
                    />
                    <MegaMenu 
                        triggerText="Support" 
                        items={supportMenuItems}
                        image={supportImage}
                    />
                </nav>
            </div>
            
            <div className="flex flex-1 items-center justify-end">
                <nav className="flex items-center space-x-2">
                    {currentUser ? (
                         <Link href="/dashboard" className={cn(buttonVariants({ variant: "default" }))}>
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href="/pricing" className={cn(buttonVariants({ variant: "ghost" }))}>
                                Pricing
                            </Link>
                            <Link href="/login" className={cn(buttonVariants({ variant: "default" }))}>
                                Login
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Find the right plan that exactly matches your team's needs. Start for free and scale as you grow.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            {showDurationSelector && (
              <Select value={duration} onValueChange={(value) => setDuration(value as Duration)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Month</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                  <SelectItem value="24">24 Months</SelectItem>
                  <SelectItem value="48">48 Months</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select value={currency} onValueChange={(value) => handleCurrencyChange(value as Currency)}>
              <SelectTrigger className="w-[120px]">
                <div className="flex items-center gap-2"><Globe className="h-4 w-4" /><SelectValue placeholder="Currency" /></div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="eur">EUR</SelectItem>
                <SelectItem value="gbp">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="py-20 border-t bg-muted">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {tiers.map((tier) => {
                const isStarter = tier.id === "starter";
                
                const actualDuration = showDurationSelector ? duration : '1';
                let checkoutHref = '#';
                if (!isStarter) {
                    checkoutHref = `/checkout?plan=${tier.id}&duration=${actualDuration}&currency=${currency}`;
                }

                const priceInfo = (() => {
                  if (isStarter || !('prices' in tier) || !tier.prices) return { price: 0, fullPrice: 0 };
                  const price = tier.prices[actualDuration]?.[currency] ?? 0;
                  const fullPrice = tier.prices["1"]?.[currency] ?? 0;
                  return { price, fullPrice };
                })();

                let finalHref: string;
                if (currentUser) {
                  if (currentUser.plan === 'starter') {
                    finalHref = isStarter ? "/dashboard" : checkoutHref;
                  } else {
                    finalHref = "/settings/billing";
                  }
                } else {
                  finalHref = isStarter ? (tier.href || '#') : checkoutHref;
                }

                const isProBestValue = tier.id === "pro";

                return (
                  <div key={tier.id} className="relative">
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
                        "flex flex-col h-full relative overflow-hidden bg-background",
                        tier.popular &&
                          (isProBestValue
                            ? "border-destructive shadow-lg"
                            : "border-primary shadow-lg"),
                        tier.premium &&
                          "border-2 border-gray-300 dark:border-gray-700 shadow-lg"
                      )}
                    >
                       {!isStarter && showDurationSelector && (
                          <div className="absolute top-4 right-4">
                            {duration === '12' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~20%</Badge>}
                            {duration === '24' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~30%</Badge>}
                            {duration === '48' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~40%</Badge>}
                          </div>
                        )}
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl pt-4">
                          {tier.name}
                        </CardTitle>
                        <div className="flex items-baseline justify-center gap-1 h-10">
                          <span className="text-4xl font-bold">
                            {isStarter
                              ? "Free"
                              : `${currencySymbols[currency]}${formatPrice(
                                  priceInfo.price,
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
                      <CardFooter className="flex-col items-stretch pt-6">
                        <Link
                          href={finalHref}
                          className={cn(
                            buttonVariants({
                                variant: isProBestValue 
                                  ? 'destructive' 
                                  : tier.popular && !tier.premium
                                    ? 'default' 
                                    : 'outline',
                            }),
                            "w-full",
                            tier.premium && "border-gray-300 dark:border-gray-700",
                            currentUser && currentUser.plan === tier.id && "pointer-events-none opacity-50"
                          )}
                        >
                          {currentUser && currentUser.plan === tier.id ? 'Current Plan' : (isStarter && currentUser ? 'Go to Dashboard' : tier.cta)}
                        </Link>
                        {!isStarter && priceInfo.fullPrice > 0 && duration !== '1' && showDurationSelector && (
                          <p className="text-xs text-muted-foreground mt-3 text-center">
                            Billed monthly. Renews at{" "}
                            {currencySymbols[currency]}
                            {formatPrice(priceInfo.fullPrice, currency)}/mo after the
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
        <section className="py-20 bg-background">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Our Guarantees</h2>
                    <p className="max-w-2xl mx-auto text-muted-foreground mt-4">
                        We stand by our product and are committed to your success.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                    {guarantees.map((guarantee) => (
                        <Card key={guarantee.title} className="text-center border-0 bg-transparent shadow-none">
                            <CardHeader>
                                <div className="mx-auto bg-muted rounded-full p-3 w-fit mb-3">
                                    <guarantee.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-xl">{guarantee.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{guarantee.description}</p>
                                {guarantee.note && (
                                    <p className="text-xs text-muted-foreground mt-2">{guarantee.note}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
      </main>
      <footer className="bg-gray-800 text-gray-300">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <FooterLogo />
            </div>
            <div className="text-center md:text-right">
              <p>&copy; {new Date().getFullYear()} AndonPro. All rights reserved.</p>
              <nav className="flex justify-center md:justify-end space-x-4 mt-2">
                <Link href="/about/our-story" className="text-sm hover:text-white">Our Story</Link>
                <Link href="/pricing" className="text-sm hover:text-white">Pricing</Link>
                <Link href="/support/contact" className="text-sm hover:text-white">Contact</Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

    

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
import { CheckCircle, Globe, Menu, ShieldCheck, LifeBuoy } from "lucide-react";
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
            usd: 'https://buy.stripe.com/4gM28q7nG9jM0sEd0O',
            eur: 'https://buy.stripe.com/7sY14mdM48fI6R2aSG',
            gbp: 'https://buy.stripe.com/bJe6oGgYggMea3e8Ky',
        },
        "12": {
            usd: 'https://buy.stripe.com/4gM28q7nG9jM0sEd0O?prefilled_promo_code=YAPPQ2YO',
            eur: 'https://buy.stripe.com/7sY14mdM48fI6R2aSG?prefilled_promo_code=YAPPQ2YO',
            gbp: 'https://buy.stripe.com/bJe6oGgYggMea3e8Ky?prefilled_promo_code=YAPPQ2YO',
        },
        "24": {
            usd: 'https://buy.stripe.com/4gM28q7nG9jM0sEd0O?prefilled_promo_code=TQ4IVSRD',
            eur: 'https://buy.stripe.com/7sY14mdM48fI6R2aSG?prefilled_promo_code=TQ4IVSRD',
            gbp: 'https://buy.stripe.com/bJe6oGgYggMea3e8Ky?prefilled_promo_code=TQ4IVSRD',
        },
        "48": {
            usd: 'https://buy.stripe.com/4gM28q7nG9jM0sEd0O?prefilled_promo_code=ALRLAVQ8',
            eur: 'https://buy.stripe.com/7sY14mdM48fI6R2aSG?prefilled_promo_code=ALRLAVQ8',
            gbp: 'https://buy.stripe.com/bJe6oGgYggMea3e8Ky?prefilled_promo_code=ALRLAVQ8',
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
            usd: 'https://buy.stripe.com/5kQdR8azS3Zseju4ui',
            eur: 'https://buy.stripe.com/eVq28q8rK53wejud0O',
            gbp: 'https://buy.stripe.com/28E00i8rK8fIfnye4S',
        },
        "12": {
            usd: 'https://buy.stripe.com/5kQdR8azS3Zseju4ui?prefilled_promo_code=YAPPQ2YO',
            eur: 'https://buy.stripe.com/eVq28q8rK53wejud0O?prefilled_promo_code=YAPPQ2YO',
            gbp: 'https://buy.stripe.com/28E00i8rK8fIfnye4S?prefilled_promo_code=YAPPQ2YO',
        },
        "24": {
            usd: 'https://buy.stripe.com/5kQdR8azS3Zseju4ui?prefilled_promo_code=TQ4IVSRD',
            eur: 'https://buy.stripe.com/eVq28q8rK53wejud0O?prefilled_promo_code=TQ4IVSRD',
            gbp: 'https://buy.stripe.com/28E00i8rK8fIfnye4S?prefilled_promo_code=TQ4IVSRD',
        },
        "48": {
            usd: 'https://buy.stripe.com/5kQdR8azS3Zseju4ui?prefilled_promo_code=ALRLAVQ8',
            eur: 'https://buy.stripe.com/eVq28q8rK53wejud0O?prefilled_promo_code=ALRLAVQ8',
            gbp: 'https://buy.stripe.com/28E00i8rK8fIfnye4S?prefilled_promo_code=ALRLAVQ8',
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
            usd: 'https://buy.stripe.com/4gM7sK8rKfIaeju0e2',
            eur: 'https://buy.stripe.com/28EdR8azSfIa4IUf8W',
            gbp: 'https://buy.stripe.com/5kQ7sK37qanQ3EQ4ui',
        },
        "12": {
            usd: 'https://buy.stripe.com/4gM7sK8rKfIaeju0e2?prefilled_promo_code=YAPPQ2YO',
            eur: 'https://buy.stripe.com/28EdR8azSfIa4IUf8W?prefilled_promo_code=YAPPQ2YO',
            gbp: 'https://buy.stripe.com/5kQ7sK37qanQ3EQ4ui?prefilled_promo_code=YAPPQ2YO',
        },
        "24": {
            usd: 'https://buy.stripe.com/4gM7sK8rKfIaeju0e2?prefilled_promo_code=TQ4IVSRD',
            eur: 'https://buy.stripe.com/28EdR8azSfIa4IUf8W?prefilled_promo_code=TQ4IVSRD',
            gbp: 'https://buy.stripe.com/5kQ7sK37qanQ3EQ4ui?prefilled_promo_code=TQ4IVSRD',
        },
        "48": {
            usd: 'https://buy.stripe.com/4gM7sK8rKfIaeju0e2?prefilled_promo_code=ALRLAVQ8',
            eur: 'https://buy.stripe.com/28EdR8azSfIa4IUf8W?prefilled_promo_code=ALRLAVQ8',
            gbp: 'https://buy.stripe.com/5kQ7sK37qanQ3EQ4ui?prefilled_promo_code=ALRLAVQ8',
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


const servicesMenuItems = [
    { title: "Production Monitoring", description: "Get a live overview of your entire production line.", badge: "", href: "/services/monitoring" },
    { title: "Issue Tracking", description: "Report, track, and resolve issues in real-time.", badge: "", href: "/services/tracking" },
    { title: "Analytics & Reporting", description: "Gain insights into your production efficiency.", badge: "", href: "/services/reporting" },
];

const exploreMenuItems = [
    { title: "Our Story", description: "Learn about the mission and vision behind AndonPro.", badge: "", href: "/about/our-story" },
    { title: "Latest News", description: "Read our latest product announcements and company news.", badge: "", href: "/about/news" },
    { title: "Customer Stories", description: "See how other companies are succeeding with AndonPro.", badge: "", href: "/about/customer-stories" },
];

const supportMenuItems = [
    { title: "FAQs", description: "Find answers to common questions about our platform.", badge: "", href: "/support/faq" },
    { title: "Tutorials", description: "Explore step-by-step guides to get the most out of AndonPro.", badge: "", href: "/support/tutorials" },
    { title: "Contact Us", description: "Get in touch with our team for personalized support.", badge: "", href: "/support/contact" },
];

const servicesImage = PlaceHolderImages.find(p => p.id === 'mega-menu-services');
const exploreImage = PlaceHolderImages.find(p => p.id === 'mega-menu-explore');
const supportImage = PlaceHolderImages.find(p => p.id === 'mega-menu-support');

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block py-2 text-muted-foreground hover:text-foreground">
        {children}
    </Link>
);


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
                    <Link href="/pricing" className={cn(buttonVariants({ variant: "ghost" }))}>
                        Pricing
                    </Link>
                    <Link href="/login" className={cn(buttonVariants({ variant: "default" }))}>
                        Login
                    </Link>
                </nav>
            </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            Find the perfect plan for your factory
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start for free and scale as you grow. All plans include unlimited issue reports.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Badge variant="secondary" className="items-center gap-1">
                <LifeBuoy className="h-4 w-4" /> 24/7 customer service
            </Badge>
            <Badge variant="secondary" className="items-center gap-1">
                <ShieldCheck className="h-4 w-4" /> 30-day money-back guarantee
            </Badge>
          </div>
          <div className="mt-10 flex items-center justify-center gap-4">
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

            <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
              <SelectTrigger className="w-[120px]">
                <div className="flex items-center gap-2"><Globe className="h-4 w-4" /><SelectValue placeholder="Currency" /></div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="eur">EUR</SelectItem>
                <SelectItem value="gbp">GBP</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 items-center">
              {duration === '12' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~20%</Badge>}
              {duration === '24' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~30%</Badge>}
              {duration === '48' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~40%</Badge>}
            </div>
          </div>
        </section>

        <section className="py-20 border-t bg-muted">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {tiers.map((tier) => {
                const isStarter = tier.name === "Starter";
                
                const priceInfo = !isStarter && tier.prices
                  ? tier.prices[duration]?.[currency] ?? 0
                  : 0;

                const fullPriceInfo = !isStarter && tier.prices
                    ? tier.prices["1"]?.[currency] ?? 0
                    : 0;
                
                const registrationHref = `/register?plan=${tier.id}&duration=${duration}&currency=${currency}`;
                
                const paymentLink = !isStarter && tier.paymentLinks
                    ? tier.paymentLinks[duration]?.[currency] ?? "#"
                    : "#";

                const finalHref = isStarter
                  ? registrationHref 
                  : currentUser
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
                        {!isStarter && fullPriceInfo > 0 && duration !== '1' && (
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
      <footer className="bg-gray-800 text-gray-300">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <FooterLogo />
            </div>
            <div className="text-center md:text-right">
              <p>&copy; {year} AndonPro. All rights reserved.</p>
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

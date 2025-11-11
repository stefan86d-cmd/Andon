
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
import { CheckCircle, Globe, Menu, Shield, Headset, BadgeCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";


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

const guarantees = [
    {
        icon: Headset,
        title: "24/7 Support",
        description: "Our support team is available around the clock to help you with any issues.",
        note: "Available on the Enterprise plan."
    },
    {
        icon: Shield,
        title: "30-Day Money-Back Guarantee",
        description: "Not satisfied? Get a full refund within the first 30 days of your subscription."
    },
    {
        icon: BadgeCheck,
        title: "Cancel Anytime",
        description: "You can cancel your subscription at any time, no questions asked."
    }
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


function PricingPageContent() {
  const [duration, setDuration] = useState<Duration>("12");
  const [currency, setCurrency] = useState<Currency>("eur");
  const { currentUser } = useUser();

  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency") as Currency;
    if (savedCurrency && ["usd", "eur", "gbp"].includes(savedCurrency)) {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleCurrencyChange = (value: Currency) => {
    setCurrency(value);
    localStorage.setItem('selectedCurrency', value);
  };


  const currencySymbols = { usd: "$", eur: "€", gbp: "£" };
  const formatPrice = (price: number, currency: Currency) => {
    const locale = { usd: "en-US", eur: "de-DE", gbp: "en-GB" }[currency];
    return price.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  const showDurationSelector = !currentUser || currentUser.plan === 'starter';
  
  const customTier = {
    name: "Custom",
    id: "custom",
    description: "For unique requirements and unlimited scale, our Custom plan offers dedicated support, custom integrations, and more. Contact us to design a plan that fits your exact needs.",
    cta: "Contact Sales"
  }

  const savingsBadge = (() => {
    if (duration === '12') return "Save ~20%";
    if (duration === '24') return "Save ~30%";
    if (duration === '48') return "Save ~40%";
    return null;
  })();


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
        <section className="py-20 text-center bg-muted">
          <div className="container">
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
                 {showDurationSelector && savingsBadge && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">
                        {savingsBadge}
                    </Badge>
                )}
              </div>
          </div>
        </section>

        <section className="py-20 bg-background">
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
                  const pricesForDuration = tier.prices as { [key in Duration]?: { [key in Currency]?: number } };
                  const price = pricesForDuration[actualDuration as keyof typeof pricesForDuration]?.[currency] ?? 0;
                  const fullPrice = pricesForDuration["1"]?.[currency] ?? 0;
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
                    <Card
                      className={cn(
                        "flex flex-col h-full relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2",
                        tier.popular &&
                          (isProBestValue
                            ? "border-destructive shadow-lg"
                            : "border-primary shadow-lg"),
                        tier.premium &&
                          "border-2 border-gray-800 dark:border-gray-700 shadow-lg"
                      )}
                    >
                        {tier.badge && (
                          <div
                            className={cn(
                              "py-2 text-center text-sm font-semibold text-white",
                              isProBestValue
                                ? "bg-destructive"
                                : tier.premium ? "bg-gray-800 dark:bg-gray-900" : "bg-primary"
                            )}
                          >
                            {tier.badge}
                          </div>
                        )}
                        <div className="relative">
                           
                           <CardHeader className="text-center">
                            <CardTitle className={cn("text-2xl", !tier.badge && "pt-8")}>
                              {tier.name}
                            </CardTitle>
                            <div className="flex flex-col items-center justify-center min-h-[60px]">
                              {isStarter ? (
                                <span className="text-4xl font-bold">Free</span>
                              ) : (
                                <>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">
                                      {currencySymbols[currency]}{formatPrice(
                                        priceInfo.price,
                                        currency
                                      )}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {tier.pricePeriod}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                            <CardDescription>{tier.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1">
                            <ul className="space-y-4">
                              {tier.features.map((feature) => (
                                <li
                                  key={feature}
                                  className="flex items-center text-sm"
                                >
                                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                                    <span className="text-muted-foreground">{feature}</span>
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
                                      : tier.popular 
                                        ? 'default' 
                                        : tier.premium
                                          ? 'default'
                                          : 'outline',
                                }),
                                "w-full",
                                 tier.premium && "bg-gray-800 hover:bg-gray-900 dark:bg-foreground dark:hover:bg-foreground/90 dark:text-background",
                                currentUser && currentUser.plan === tier.id && "pointer-events-none opacity-50"
                              )}
                            >
                              {currentUser && currentUser.plan === tier.id ? 'Current Plan' : (isStarter && currentUser ? 'Go to Dashboard' : tier.cta)}
                            </Link>
                             <div className="text-xs text-muted-foreground mt-3 text-center min-h-[36px]">
                                {!isStarter && duration !== '1' && showDurationSelector ? (
                                    <>
                                        Renews at {currencySymbols[currency]}{formatPrice(priceInfo.fullPrice, currency)}/month after {duration} months.
                                        <br/>
                                        Promotional pricing applies to the initial term only.
                                    </>
                                ) : isStarter ? (
                                    "No credit card required."
                                ) : (
                                    "Billed monthly. Cancel anytime."
                                )}
                            </div>
                          </CardFooter>
                        </div>
                    </Card>
                  </div>
                );
              })}
            </div>
            <div className="mt-20">
                <Card className="bg-muted/50">
                    <div className="grid md:grid-cols-3 items-center">
                        <div className="p-8 md:col-span-2">
                            <h2 className="text-2xl font-bold">{customTier.name}</h2>
                            <p className="text-muted-foreground mt-2">
                                {customTier.description}
                            </p>
                        </div>
                        <div className="p-8 text-center md:text-right border-t md:border-t-0 md:border-l">
                            <Link href="/support/contact" className={cn(buttonVariants({ size: 'lg' }))}>
                                {customTier.cta} <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
          </div>
        </section>
        <section className="py-20 bg-muted border-t">
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
                                <div className="mx-auto bg-background rounded-full p-3 w-fit mb-3">
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

export default function PricingPage() {
    return (
        <React.Suspense>
            <PricingPageContent />
        </React.Suspense>
    );
}

    
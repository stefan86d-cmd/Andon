
"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Factory, ClipboardList, LayoutDashboard, BarChart3, Bot, UserCog, LifeBuoy, Puzzle, ShieldCheck, Headset, Shield, BadgeCheck, CheckCircle, Globe, ArrowRight, Menu } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MegaMenu } from "@/components/layout/mega-menu";
import FooterLogo from "@/components/layout/footer-logo";
import { useUser } from "@/contexts/user-context";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const tiers = [
  {
    name: "Starter",
    id: "starter",
    prices: {
        '1': { 
            usd: { price: 0, id: 'price_starter_usd' }, 
            eur: { price: 0, id: 'price_starter_eur' }, 
            gbp: { price: 0, id: 'price_starter_gbp' } 
        },
    },
    pricePeriod: "",
    description: "For small teams getting started with issue tracking.",
    features: [
      { text: "Up to 5 users" },
      { text: "1 Production Line" },
      { text: "Up to 5 workstations" },
      { text: "Basic Issue Reporting" },
      { text: "Dashboard View" },
    ],
    cta: "Get Started",
  },
  {
    name: "Standard",
    id: "standard",
    prices: {
        '1': { // Monthly
            usd: { price: 39.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_1_USD! },
            eur: { price: 36.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_1_EUR! },
            gbp: { price: 32.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_1_GBP! },
        },
        '12': { // 12 Months
            usd: { price: 31.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_12_USD! },
            eur: { price: 29.59, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_12_EUR! },
            gbp: { price: 26.39, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_12_GBP! },
        },
        '24': { // 24 Months
            usd: { price: 27.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_24_USD! },
            eur: { price: 25.89, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_24_EUR! },
            gbp: { price: 23.09, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_24_GBP! },
        },
        '48': { // 48 Months
            usd: { price: 23.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_48_USD! },
            eur: { price: 22.19, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_48_EUR! },
            gbp: { price: 19.79, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_48_GBP! },
        }
    },
    pricePeriod: "/ month",
    description: "For growing factories that need more power and insights.",
    features: [
      { text: "Up to 80 users" },
      { text: "Up to 5 Production Lines" },
      { text: "Up to 10 workstations per line" },
      { text: "Advanced Reporting & Analytics" },
      { text: "User Role Management" },
    ],
    cta: "Upgrade to Standard",
    badge: "Most popular",
    popular: true,
  },
  {
    name: "Pro",
    id: "pro",
    prices: {
        '1': {
            usd: { price: 59.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_1_USD! },
            eur: { price: 54.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_1_EUR! },
            gbp: { price: 49.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_1_GBP! },
        },
        '12': {
            usd: { price: 47.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_12_USD! },
            eur: { price: 43.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_12_EUR! },
            gbp: { price: 39.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_12_GBP! },
        },
        '24': {
            usd: { price: 41.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_24_USD! },
            eur: { price: 38.49, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_24_EUR! },
            gbp: { price: 34.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_24_GBP! },
        },
        '48': {
            usd: { price: 35.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_48_USD! },
            eur: { price: 32.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_48_EUR! },
            gbp: { price: 29.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_48_GBP! },
        }
    },
    pricePeriod: "/ month",
    description: "For scaling operations with expanded needs.",
    features: [
        { text: "Up to 150 users" },
        { text: "Up to 10 Production Lines" },
        { text: "Up to 15 workstations per line" },
        { text: "Advanced Reporting & Analytics" },
        { text: "User Role Management" },
        { text: "Priority Support" },
    ],
    cta: "Upgrade to Pro",
    badge: "Best Value",
    popular: true,
    badgeVariant: "destructive" as "destructive",
  },
  {
    name: "Enterprise",
    id: "enterprise",
    prices: {
        '1': {
            usd: { price: 149.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_1_USD! },
            eur: { price: 139.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_1_EUR! },
            gbp: { price: 124.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_1_GBP! },
        },
        '12': {
            usd: { price: 119.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_12_USD! },
            eur: { price: 111.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_12_EUR! },
            gbp: { price: 99.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_12_GBP! },
        },
        '24': {
            usd: { price: 104.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_24_USD! },
            eur: { price: 97.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_24_EUR! },
            gbp: { price: 87.49, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_24_GBP! },
        },
        '48': {
            usd: { price: 89.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_48_USD! },
            eur: { price: 83.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_48_EUR! },
            gbp: { price: 74.99, id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_48_GBP! },
        }
    },
    pricePeriod: "/ month",
    description: "For large-scale operations with expanded resources.",
    features: [
      { text: "Up to 400 users" },
      { text: "20 Production Lines" },
      { text: "Up to 20 workstations per line" },
      { text: "User Role Management" },
      { text: "Advanced Reporting & Analytics" },
      { text: "24/7 Priority Support" },
    ],
    cta: "Sign up as Premium",
    badge: "Premium",
    premium: true,
  },
];

const customTier = {
    name: "Custom",
    id: "custom",
    description: "For unique requirements and unlimited scale, our Custom plan offers dedicated support, custom integrations, and more. Contact us to design a plan that fits your exact needs.",
    cta: "Contact Sales"
}

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
]

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

type Duration = '1' | '12' | '24' | '48';
type Currency = 'usd' | 'eur' | 'gbp';

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block py-2 text-muted-foreground hover:text-foreground">
        {children}
    </Link>
);


export default function PricingPage() {
    const [duration, setDuration] = useState<Duration>('12');
    const [currency, setCurrency] = useState<Currency>('usd');
    const { currentUser } = useUser();
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);
    const currencySymbols = {
        usd: '$',
        eur: '€',
        gbp: '£',
    }
    
    const formatPrice = (price: number, currency: Currency) => {
        const locale = {
            usd: 'en-US',
            eur: 'de-DE',
            gbp: 'en-GB'
        }[currency];
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
        <section className="py-20 bg-muted/50">
            <div className="container">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold">Pricing Plans</h1>
                    <p className="text-lg text-muted-foreground mt-2 max-w-xl mx-auto">
                        Choose the plan that's right for your production needs. No hidden fees, clear and simple.
                    </p>
                </div>
                 <div className="flex flex-col items-center justify-center mt-12 mb-0 space-y-2">
                    <div className="flex space-x-2 items-center">
                        <Select value={duration} onValueChange={(value) => setDuration(value as any)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 Month</SelectItem>
                                <SelectItem value="12">12 Months</SelectItem>
                                <SelectItem value="24">24 Months</SelectItem>
                                <SelectItem value="48">48 Months</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={currency} onValueChange={(value) => setCurrency(value as any)}>
                            <SelectTrigger className="w-[150px]">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Savings apply for the first billing period of your subscription.
                    </p>
                </div>
            </div>
        </section>
        
        <section className="py-20 border-t bg-background">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {tiers.map((tier) => {
                        const priceInfo = tier.name !== 'Starter' ? tier.prices[duration]?.[currency] : null;
                        const fullPriceInfo = tier.name !== 'Starter' ? tier.prices['1']?.[currency] : null;
                        
                        const monthlyPrice = priceInfo ? priceInfo.price : 0;
                        const fullMonthlyPrice = fullPriceInfo ? fullPriceInfo.price : 0;
                        const priceId = priceInfo ? priceInfo.id : '';

                        const isProBestValue = tier.name === "Pro";
                        const linkHref = tier.id === 'starter'
                            ? `/register?plan=starter`
                            : `/checkout?priceId=${priceId}`;
                        
                        let ctaText = tier.cta;
                        if (!currentUser && (tier.name === "Standard" || tier.name === "Pro" || tier.name === "Enterprise")) {
                            ctaText = "Choose Plan";
                        }
                        
                        return (
                            <div key={tier.name} className="relative">
                                {tier.badge && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                                        <Badge variant={tier.badgeVariant || (tier.premium ? "secondary" : "default")} className={cn("text-sm", tier.premium && "text-foreground border-border")}>{tier.badge}</Badge>
                                    </div>
                                )}
                                <Card className={cn("flex flex-col h-full relative overflow-hidden", 
                                    tier.popular && (isProBestValue ? 'border-destructive shadow-lg' : 'border-primary shadow-lg'),
                                    tier.premium && "border-2 border-gray-300 dark:border-gray-700 shadow-lg"
                                )}>
                                    <div className="absolute top-2 right-2">
                                    {duration === '12' && tier.name !== 'Starter' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~20%</Badge>}
                                    {duration === '24' && tier.name !== 'Starter' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~30%</Badge>}
                                    {duration === '48' && tier.name !== 'Starter' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80">Save ~40%</Badge>}
                                    </div>

                                    <CardHeader className="text-center">
                                        <CardTitle className="text-2xl pt-4">{tier.name}</CardTitle>
                                        <div className="flex items-baseline justify-center gap-1 h-10">
                                            
                                            <span className="text-4xl font-bold">
                                                {tier.name === 'Starter'
                                                    ? 'Free'
                                                    : `${currencySymbols[currency]}${formatPrice(monthlyPrice, currency)}`
                                                }
                                            </span>
                                            {tier.pricePeriod && typeof monthlyPrice === 'number' && monthlyPrice > 0 && <span className="text-muted-foreground">{tier.pricePeriod}</span>}
                                        
                                        </div>
                                        <CardDescription>{tier.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-4">
                                        {tier.features.map((feature) => (
                                            <li key={feature.text} className="flex items-center">
                                                <Badge variant="outline" className="border-0 font-medium text-green-600">
                                                    <CheckCircle className="h-5 w-5 mr-2" />
                                                    <span>{feature.text}</span>
                                                </Badge>
                                            </li>
                                        ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter className="flex-col items-stretch">
                                        <Link href={linkHref} className={cn(buttonVariants({ 
                                            variant: isProBestValue ? 'destructive' : (tier.popular ? 'default' : 'outline'),
                                        }), "w-full")}>
                                            {ctaText}
                                        </Link>
                                         {tier.name !== 'Starter' && fullPriceInfo && (
                                            <p className="text-xs text-muted-foreground mt-3 text-center">
                                               Billed monthly. Renews at {currencySymbols[currency]}{formatPrice(fullPriceInfo.price, currency)}/mo after the first {duration} months.
                                            </p>
                                         )}
                                         {tier.name === 'Starter' && (
                                            <p className="text-xs text-muted-foreground mt-3 text-center h-8">
                                                No credit card required.
                                            </p>
                                         )}
                                    </CardFooter>
                                </Card>
                            </div>
                        )
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

        <section className="py-20 border-t bg-muted/50">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Peace of Mind</h2>
                    <p className="max-w-2xl mx-auto text-muted-foreground mt-4">
                        We're committed to your success. Our plans come with guarantees to ensure you're always supported.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {guarantees.map((guarantee) => {
                        const Icon = guarantee.icon;
                        return (
                            <div key={guarantee.title} className="flex flex-col items-center text-center">
                                <div className="p-4 bg-background rounded-full border mb-4">
                                    <Icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg">{guarantee.title}</h3>
                                <p className="text-muted-foreground mt-2 text-sm">{guarantee.description}</p>
                                {guarantee.note && (
                                    <p className="text-xs text-muted-foreground mt-1">({guarantee.note})</p>
                                )}
                            </div>
                        )
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


"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Factory, ClipboardList, LayoutDashboard, BarChart3, Bot, UserCog, LifeBuoy, Puzzle, ShieldCheck, Headset, Shield, BadgeCheck, CheckCircle, Globe } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MegaMenu } from "@/components/layout/mega-menu";
import FooterLogo from "@/components/layout/footer-logo";
import { useUser } from "@/contexts/user-context";


const tiers = [
  {
    name: "Starter",
    prices: {
        '1': { usd: 0, eur: 0, gbp: 0 },
        '12': { usd: 0, eur: 0, gbp: 0 },
        '24': { usd: 0, eur: 0, gbp: 0 },
        '48': { usd: 0, eur: 0, gbp: 0 },
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
    prices: {
        '1': { usd: 39.99, eur: 36.99, gbp: 32.99 },
        '12': { usd: 31.99, eur: 29.99, gbp: 26.99 },
        '24': { usd: 27.99, eur: 25.99, gbp: 22.99 },
        '48': { usd: 23.99, eur: 21.99, gbp: 19.99 },
    },
    pricePeriod: "/ month",
    description: "For growing factories that need more power and insights.",
    features: [
      { text: "Up to 50 users" },
      { text: "Up to 5 Production Lines" },
      { text: "Up to 10 workstations per line" },
      { text: "Advanced Reporting & Analytics" },
      { text: "AI-Powered Issue Prioritization" },
      { text: "User Role Management" },
    ],
    cta: "Upgrade to Standard",
    badge: "Most popular",
    popular: true,
  },
  {
    name: "Pro",
    prices: {
        '1': { usd: 59.99, eur: 54.99, gbp: 49.99 },
        '12': { usd: 47.99, eur: 43.99, gbp: 39.99 },
        '24': { usd: 41.99, eur: 38.99, gbp: 34.99 },
        '48': { usd: 35.99, eur: 32.99, gbp: 29.99 },
    },
    pricePeriod: "/ month",
    description: "For scaling operations with expanded needs.",
    features: [
        { text: "Up to 150 users" },
        { text: "Up to 10 Production Lines" },
        { text: "Up to 15 workstations per line" },
        { text: "Advanced Reporting & Analytics" },
        { text: "AI-Powered Issue Prioritization" },
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
    prices: {
        '1': { usd: 149.99, eur: 139.99, gbp: 124.99 },
        '12': { usd: 119.99, eur: 111.99, gbp: 99.99 },
        '24': { usd: 104.99, eur: 97.99, gbp: 87.99 },
        '48': { usd: 89.99, eur: 83.99, gbp: 74.99 },
    },
    pricePeriod: "/ month",
    description: "For large-scale operations with unlimited resources and dedicated support.",
    features: [
      { text: "Unlimited Users & Lines" },
      { text: "Advanced Reporting & Analytics" },
      { text: "AI-Powered Issue Prioritization" },
      { text: "User Role Management" },
      { text: "Priority Support" },
      { text: "24/7 Support" }
    ],
    cta: "Choose Plan",
  },
];

const guarantees = [
    {
        icon: Headset,
        title: "24/7 Support",
        description: "Our support team is available around the clock to help you with any issues."
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

const servicesImage = {
    imageUrl: "/Factory.jpg",
    description: "Image of a factory production line",
    imageHint: "production factory",
};

const exploreImage = {
    imageUrl: "/Helsinki.jpg",
    description: "Image of Helsinki for explore mega menu",
    imageHint: "Helsinki cityscape",
};

const supportImage = {
    imageUrl: "/Tech_support.jpg",
    description: "Image for support mega menu",
    imageHint: "technical support",
};

type Duration = '1' | '12' | '24' | '48';
type Currency = 'usd' | 'eur' | 'gbp';

export default function PricingPage() {
    const [duration, setDuration] = useState<Duration>('12');
    const [currency, setCurrency] = useState<Currency>('usd');
    const { currentUser } = useUser();
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
                <div className="mr-4 hidden md:flex items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <Logo />
                    </Link>
                    <nav className="flex items-center space-x-1 text-sm">
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
                        {duration === '12' && <Badge variant="secondary" className="text-sm">Save ~20%</Badge>}
                        {duration === '24' && <Badge variant="secondary" className="text-sm">Save ~30%</Badge>}
                        {duration === '48' && <Badge variant="secondary" className="text-sm">Save ~40%</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Savings apply to your first billing period.
                    </p>
                </div>
            </div>
        </section>
        
        <section className="py-20 border-t bg-background">
            <div className="container">

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {tiers.map((tier) => {
                        const monthlyPrice = tier.prices[duration][currency];
                        const fullMonthlyPrice = tier.prices['1'][currency];
                        const totalDiscountedPrice = monthlyPrice * parseInt(duration, 10);
                        const totalRegularPrice = fullMonthlyPrice * parseInt(duration, 10);
                        const isProBestValue = tier.name === "Pro";
                        const linkHref = `/checkout?plan=${tier.name.toLowerCase()}&duration=${duration}&currency=${currency}`;
                        
                        let ctaText = tier.cta;
                        if (!currentUser && (tier.name === "Standard" || tier.name === "Pro")) {
                            ctaText = "Choose Plan";
                        }
                        
                        return (
                            <div key={tier.name} className="relative">
                                {tier.badge && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                                        <Badge variant={tier.badgeVariant || 'default'} className="text-sm">{tier.badge}</Badge>
                                    </div>
                                )}
                                <Card className={`flex flex-col h-full ${tier.popular ? (isProBestValue ? 'border-destructive shadow-lg' : 'border-primary shadow-lg') : ''}`}>
                                    <CardHeader className="text-center">
                                        <CardTitle className="text-2xl">{tier.name}</CardTitle>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-4xl font-bold">
                                                 {typeof monthlyPrice === 'number'
                                                    ? `${currencySymbols[currency]}${formatPrice(monthlyPrice, currency)}`
                                                    : monthlyPrice
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
                                         {tier.name !== 'Starter' && duration !== '1' && (
                                            <p className="text-xs text-muted-foreground mt-3 text-center">
                                                Get {duration} months for {currencySymbols[currency]}{formatPrice(totalDiscountedPrice, currency)} (regular price {currencySymbols[currency]}{formatPrice(totalRegularPrice, currency)}). Renews at {currencySymbols[currency]}{formatPrice(fullMonthlyPrice, currency)}/mo.
                                            </p>
                                        )}
                                         {tier.name !== 'Starter' && duration === '1' && (
                                            <p className="text-xs text-muted-foreground mt-3 text-center">
                                                Renews at {currencySymbols[currency]}{formatPrice(fullMonthlyPrice, currency)}/mo. Cancel anytime.
                                            </p>
                                        )}
                                    </CardFooter>
                                </Card>
                            </div>
                        )
                    })}
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


"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Factory, ClipboardList, LayoutDashboard, BarChart3, Bot, UserCog, LifeBuoy, Puzzle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Starter",
    price: "Free",
    description: "For small teams getting started with issue tracking.",
    features: [
      { text: "Up to 5 users", icon: Users },
      { text: "1 Production Line", icon: Factory },
      { text: "Basic Issue Reporting", icon: ClipboardList },
      { text: "Dashboard View", icon: LayoutDashboard },
    ],
    cta: "Get Started",
  },
  {
    name: "Standard",
    price: "$39",
    pricePeriod: "/ month",
    description: "For growing factories that need more power and insights.",
    features: [
      { text: "Up to 20 users", icon: Users },
      { text: "Up to 5 Production Lines", icon: Factory },
      { text: "Advanced Reporting & Analytics", icon: BarChart3 },
      { text: "AI-Powered Issue Prioritization", icon: Bot },
      { text: "User Role Management", icon: UserCog },
    ],
    cta: "Upgrade to Standard",
    badge: "Most Popular",
    popular: true,
  },
  {
    name: "Pro",
    price: "$59",
    pricePeriod: "/ month",
    description: "For scaling operations with expanded needs.",
    features: [
        { text: "Up to 50 users", icon: Users },
        { text: "Up to 10 Production Lines", icon: Factory },
        { text: "Advanced Reporting & Analytics", icon: BarChart3 },
        { text: "AI-Powered Issue Prioritization", icon: Bot },
        { text: "User Role Management", icon: UserCog },
        { text: "Priority Support", icon: LifeBuoy },
    ],
    cta: "Upgrade to Pro",
    badge: "Best Value",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale operations with custom needs.",
    features: [
      { text: "Unlimited Users & Lines", icon: Users },
      { text: "Dedicated Support & Onboarding", icon: LifeBuoy },
      { text: "Custom Integrations", icon: Puzzle },
      { text: "Enhanced Security & Compliance", icon: ShieldCheck },
    ],
    cta: "Contact Sales",
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                <Logo />
                </Link>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <nav className="flex items-center space-x-4">
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
        <section className="py-20 md:py-32">
            <div className="container">
                <div className="text-center">
                <h1 className="text-3xl font-semibold md:text-4xl">Pricing Plans</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Choose the plan that's right for your production needs.
                </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12 max-w-7xl mx-auto">
                {tiers.map((tier) => (
                    <Card key={tier.name} className={`flex flex-col ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
                    <CardHeader className="text-center">
                        {tier.badge && <div className="text-primary font-semibold mb-2">{tier.badge}</div>}
                        <CardTitle className="text-2xl">{tier.name}</CardTitle>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-bold">{tier.price}</span>
                            {tier.pricePeriod && <span className="text-muted-foreground">{tier.pricePeriod}</span>}
                        </div>
                        <CardDescription>{tier.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="space-y-4">
                        {tier.features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <li key={feature.text} className="flex items-start">
                                    <Icon className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                                    <span>{feature.text}</span>
                                </li>
                            );
                        })}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                        {tier.cta}
                        </Button>
                    </CardFooter>
                    </Card>
                ))}
                </div>
            </div>
        </section>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by you and your AI partner.
          </p>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} AndonPro, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

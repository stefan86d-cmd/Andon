
"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Factory, ClipboardList, LayoutDashboard, BarChart3, Bot, UserCog, LifeBuoy, Puzzle, ShieldCheck, Headphones, Shield, BadgeCheck, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const tiers = [
  {
    name: "Starter",
    price: "Free",
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
    price: "$39",
    pricePeriod: "/ month",
    description: "For growing factories that need more power and insights.",
    features: [
      { text: "Up to 20 users" },
      { text: "Up to 5 Production Lines" },
      { text: "Advanced Reporting & Analytics" },
      { text: "AI-Powered Issue Prioritization" },
      { text: "User Role Management" },
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
        { text: "Up to 50 users" },
        { text: "Up to 10 Production Lines" },
        { text: "Advanced Reporting & Analytics" },
        { text: "AI-Powered Issue Prioritization" },
        { text: "User Role Management" },
        { text: "Priority Support" },
    ],
    cta: "Upgrade to Pro",
    popular: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale operations with custom needs.",
    features: [
      { text: "Unlimited Users & Lines" },
      { text: "Dedicated Support & Onboarding" },
      { text: "Custom Integrations" },
      { text: "Enhanced Security & Compliance" },
    ],
    cta: "Contact Sales",
  },
];

const guarantees = [
    {
        icon: Headphones,
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
                <h1 className="text-3xl md:text-4xl font-bold">Pricing Plans</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-xl mx-auto">
                    Choose the plan that's right for your production needs. No hidden fees, clear and simple.
                </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-16 max-w-7xl mx-auto">
                {tiers.map((tier) => (
                    <div key={tier.name} className="relative">
                        {tier.badge && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                                <Badge variant="default" className="text-sm">{tier.badge}</Badge>
                            </div>
                        )}
                        <Card className={`flex flex-col h-full ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold">{tier.price}</span>
                                    {tier.pricePeriod && <span className="text-muted-foreground">{tier.pricePeriod}</span>}
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
                            <CardFooter>
                                <Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                                {tier.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
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

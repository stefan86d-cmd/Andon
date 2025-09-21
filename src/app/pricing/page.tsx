
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "Free",
    description: "For small teams getting started with issue tracking.",
    features: [
      "Up to 5 users",
      "1 Production Line",
      "Basic Issue Reporting",
      "Dashboard View",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$49",
    pricePeriod: "/ month",
    description: "For growing factories that need more power and insights.",
    features: [
      "Up to 20 users",
      "Up to 5 Production Lines",
      "Advanced Reporting & Analytics",
      "AI-Powered Issue Prioritization",
      "User Role Management",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale operations with custom needs.",
    features: [
      "Unlimited Users & Lines",
      "Dedicated Support & Onboarding",
      "Custom Integrations",
      "Enhanced Security & Compliance",
    ],
    cta: "Contact Sales",
  },
];

export default function PricingPage() {
  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-10 bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-semibold md:text-4xl">Pricing Plans</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Choose the plan that's right for your production needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <Card key={tier.name} className={`flex flex-col ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
              <CardHeader className="text-center">
                {tier.popular && <div className="text-primary font-semibold mb-2">Most Popular</div>}
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
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>{feature}</span>
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
          ))}
        </div>
      </main>
    </AppLayout>
  );
}

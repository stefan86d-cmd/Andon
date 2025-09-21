
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Factory, BarChart3, Users, Bot } from 'lucide-react';
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <Factory className="h-10 w-10 text-primary" />,
    title: 'Real-Time Monitoring',
    description: 'Get a live overview of your entire production line. Instantly see workstation statuses and active issues.',
  },
  {
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Prioritization',
    description: 'Leverage AI to automatically assess the urgency of reported issues, helping your team focus on what matters most.',
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: 'Insightful Reporting',
    description: 'Track key performance indicators, analyze downtime, and identify recurring problems with our comprehensive reports.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Seamless Collaboration',
    description: 'Connect operators, supervisors, and management with a centralized system for reporting and resolving issues.',
  },
];


export default function HomePage() {
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
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
              Empower Your Production Line
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
              AndonPro is the modern solution to monitor workflow, report issues instantly, and minimize downtime with AI-powered insights.
            </p>
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Why AndonPro?</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mt-4">
                Everything you need to optimize your manufacturing process and resolve issues faster than ever before.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center">
                  <CardHeader>
                    <div className="mx-auto bg-muted rounded-full p-4 w-fit mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Boost Your Factory's Efficiency?</h2>
            <p className="text-muted-foreground mb-8">
              Sign up today and take the first step towards a smarter production line.
            </p>
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
              Sign Up Now
            </Link>
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

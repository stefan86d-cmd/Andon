
"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Factory, BarChart3, Wrench, PiggyBank } from 'lucide-react';
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import FooterLogo from "@/components/layout/footer-logo";
import Image from "next/image";
import { useState, useEffect } from 'react';

const features = [
  {
    icon: <Factory className="h-10 w-10 text-primary" />,
    title: 'Real-Time Monitoring',
    description: 'Get a live overview of your entire production line. Instantly see workstation statuses and active issues.',
  },
  {
    icon: <Wrench className="h-10 w-10 text-primary" />,
    title: 'Customizable Workflows',
    description: 'Unlike other monitoring tools, AndonPro allows you to fully customize and edit your production lines and workstations.',
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: 'Insightful Reporting',
    description: 'Track key performance indicators, analyze downtime, and identify recurring problems with our comprehensive reports.',
  },
  {
    icon: <PiggyBank className="h-10 w-10 text-primary" />,
    title: 'Affordable Pricing',
    description: 'Get started for free and scale with flexible, transparent pricing plans that fit teams and factories of all sizes.',
  },
];

export default function HomePage() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Logo />
            </Link>
          </div>
          <nav className="flex flex-1 items-center justify-end space-x-2">
            <Link href="/pricing" className={cn(buttonVariants({ variant: "ghost" }))}>
              Pricing
            </Link>
            <Link href="/login" className={cn(buttonVariants({ variant: "default" }))}>
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-white">
          <div className="absolute inset-0">
            <Image
              src="/Production.jpg"
              alt="Factory production line"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="container text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
              Empower Your Production Line
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-200 mb-8">
              AndonPro is the modern solution to monitor workflow, report issues instantly, and minimize downtime with powerful data exports.
            </p>
            <Link href="/pricing" className={cn(buttonVariants({ size: "lg" }))}>
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
            <Link href="/pricing" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
              Sign Up Now
            </Link>
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


"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Factory, BarChart3, Wrench, HandCoins, Menu, Settings, MessageSquareWarning, PieChart, UserCog, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import FooterLogo from "@/components/layout/footer-logo";
import Image from "next/image";
import { MegaMenu } from "@/components/layout/mega-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const features = [
  {
    icon: <Factory className="h-10 w-10 text-primary" />,
    title: 'Real-Time Monitoring',
    description: 'Get a live overview of your entire production line. Instantly see workstation statuses and active issues.',
  },
  {
    icon: <Wrench className="h-10 w-10 text-primary" />,
    title: 'Customizable Workflows',
    description: 'AndonPro allows you to fully customize and edit your production lines to perfectly fit your operational needs.',
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: 'Insightful Reporting',
    description: 'Track key performance indicators, analyze downtime, and identify recurring problems with our comprehensive reports.',
  },
  {
    icon: <HandCoins className="h-10 w-10 text-primary" />,
    title: 'Affordable Pricing',
    description: 'Get started for free and scale with flexible, transparent pricing plans that fit teams and factories of all sizes.',
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

export default function HomePage() {
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

        {/* How It Works Section */}
        <section className="py-20 bg-background">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
                    <p className="max-w-2xl mx-auto text-muted-foreground mt-4">
                        A simple, 3-step process to get you up and running in minutes.
                    </p>
                </div>
                <div className="grid gap-10 md:grid-cols-3">
                    <div className="text-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                            <Settings className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">1. Configure Your Lines</h3>
                        <p className="text-muted-foreground">Quickly set up your production lines and workstations to match your factory floor.</p>
                    </div>
                     <div className="text-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                            <MessageSquareWarning className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">2. Report Issues Instantly</h3>
                        <p className="text-muted-foreground">Operators report problems from any device in seconds, notifying supervisors immediately.</p>
                    </div>
                     <div className="text-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                            <PieChart className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">3. Resolve and Analyze</h3>
                        <p className="text-muted-foreground">Supervisors manage issues, resolve them, and use reports to track performance.</p>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Who Is It For? Section */}
        <section className="py-20 bg-muted">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Built for Your Team</h2>
                    <p className="max-w-2xl mx-auto text-muted-foreground mt-4">
                        The right tools for everyone, from the factory floor to the manager's office.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex-row items-center gap-4">
                             <div className="p-3 bg-primary/10 rounded-full text-primary"><UserCog className="h-6 w-6"/></div>
                            <CardTitle>Admins</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Configure production lines, manage users, and oversee the entire organization with powerful administrative tools.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex-row items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full text-primary"><ShieldCheck className="h-6 w-6"/></div>
                            <CardTitle>Supervisors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Monitor the factory floor, respond to issues in real-time, and analyze performance reports to drive efficiency.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex-row items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full text-primary"><UserIcon className="h-6 w-6"/></div>
                            <CardTitle>Operators</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Instantly report issues from any workstation using a simple, intuitive interface, minimizing downtime.</p>
                        </CardContent>
                    </Card>
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

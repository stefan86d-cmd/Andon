
"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { MegaMenu } from "@/components/layout/mega-menu";
import { buttonVariants } from "@/components/ui/button";
import { Construction, Menu } from "lucide-react";
import FooterLogo from "@/components/layout/footer-logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState, useEffect } from "react";

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


export default function CustomerStoriesPage() {
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);
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
        <section className="py-20 text-center bg-background">
            <div className="container">
                <h1 className="text-4xl font-bold mb-4">Customer Stories</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">See how other companies are succeeding with AndonPro.</p>
            </div>
        </section>
        <section className="py-20 bg-muted">
            <div className="container text-center">
                <div className="max-w-md mx-auto">
                    <Construction className="h-16 w-16 mx-auto text-primary mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Coming Soon!</h2>
                    <p className="text-muted-foreground">
                        We've just launched and are busy helping our first customers achieve amazing results. Check back soon to read their success stories!
                    </p>
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

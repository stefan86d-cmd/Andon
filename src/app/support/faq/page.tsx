
"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { MegaMenu } from "@/components/layout/mega-menu";
import { buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import FooterLogo from "@/components/layout/footer-logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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

const faqs = [
    {
        question: "What is AndonPro?",
        answer: () => (
            <p>
                AndonPro is a modern, intuitive application designed to monitor and manage production line workflows. It allows operators to report issues in real-time from any workstation, which helps teams minimize downtime and improve overall efficiency. Supervisors and administrators get a live overview of the entire production line, can track key performance indicators, and use data-driven insights to make decisions.
            </p>
        )
    },
    {
        question: "What are the different user roles?",
        answer: () => (
            <>
                <p>AndonPro has three distinct user roles to ensure that team members have access to the features they need:</p>
                <ul className='list-disc pl-5 space-y-2 mt-2'>
                    <li><strong>Admin:</strong> Has full control over the entire system, including user management, production line configuration, billing, and access to all reports and dashboards.</li>
                    <li><strong>Supervisor:</strong> Oversees production line operations. They can manage and resolve issues, monitor dashboards, and view reports, but cannot manage users or billing.</li>
                    <li><strong>Operator:</strong> Works on the production line. Their primary function is to report issues from their assigned workstation quickly and efficiently.</li>
                </ul>
            </>
        )
    },
    {
        question: "How do I sign up for AndonPro?",
        answer: () => (
           <p>
                You can sign up using your existing Google account for a fast and secure registration process. Alternatively, you can register directly with your email address and create a new password. Simply choose your preferred option on the registration page to get started.
           </p>
        )
    },
    {
        question: "How is payment handled?",
        answer: () => (
            <p>
                We use <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe</a> to handle all payment processing. Stripe is a certified PCI Service Provider Level 1, the most stringent level of certification available in the payments industry. This ensures that your payment information is handled securely and safely. We do not store your credit card information on our servers.
            </p>
        )
    },
    {
        question: "What pricing tiers are available?",
        answer: () => (
            <p>
                We offer a range of pricing tiers to fit teams of all sizes. Our plans include a free <strong>Starter</strong> tier for small teams, a <strong>Standard</strong> tier for growing factories, a <strong>Pro</strong> tier with advanced features, an <strong>Enterprise</strong> plan for large-scale operations, and a <strong>Custom</strong> plan for unique requirements. You can find detailed information on our <Link href='/pricing' className='text-primary underline'>Pricing Page</Link>.
            </p>
        )
    },
    {
        question: "How customizable is the platform?",
        answer: () => (
            <p>
                AndonPro is highly customizable. Administrators can define their own production lines and add, edit, or remove the specific workstations within each line. This ensures that the application's structure perfectly mirrors your factory's layout and workflow.
            </p>
        )
    },
    {
        question: "Is AndonPro a mobile or desktop application?",
        answer: () => (
            <p>
                AndonPro is a fully responsive, web-based application, which means it works on any device with a modern web browser, including desktops, tablets, and mobile phones. While it scales to fit any screen size, the administrative and supervisor dashboards are optimized for the best experience on a PC or Mac.
            </p>
        )
    },
    {
        question: "What issue categories can I report?",
        answer: () => (
            <>
                <p>AndonPro comes with several predefined categories to help you classify issues effectively. These include:</p>
                <ul className='list-disc pl-5 space-y-2 mt-2'>
                    <li>IT & Network</li>
                    <li>Logistics</li>
                    <li>Tool & Equipment</li>
                    <li>Quality Control</li>
                    <li>Need Assistance</li>
                    <li>Other</li>
                </ul>
                <p className="mt-2">We are constantly working on expanding our features and adding more customization options for future releases.</p>
            </>
        )
    },
    {
        question: "Does AndonPro support dark and light modes?",
        answer: () => (
            <p>
                Yes, AndonPro supports both light and dark themes. You can switch between them, or set it to follow your system's preference. Your choice is saved to your user profile and can be changed at any time from the user menu in the top-right corner or in your account settings.
            </p>
        )
    },
    {
        question: "How do I manage my notifications?",
        answer: () => (
            <p>
                You can control your notification preferences in the 'Settings' page. This includes enabling or disabling email alerts for new or resolved issues. You can also mute all notification sounds within the app from the bell icon in the header.
            </p>
        )
    }
]

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block py-2 text-muted-foreground hover:text-foreground">
        {children}
    </Link>
);


export default function FaqPage() {
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
        <section className="bg-background py-20">
            <div className="container text-center">
              <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">Find answers to common questions about our platform. Can't find what you're looking for? <Link href="/support/contact" className="text-primary hover:underline">Contact us</Link>.</p>
            </div>
        </section>

        <section className="bg-muted py-20">
            <div className="container max-w-4xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index + 1}`} key={index}>
                            <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                                <faq.answer />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
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

    

    
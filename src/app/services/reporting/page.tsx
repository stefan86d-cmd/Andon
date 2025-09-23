
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { MegaMenu } from "@/components/layout/mega-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

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

export default function AnalyticsReportingPage() {
    const servicesImage = PlaceHolderImages.find(img => img.id === 'mega-menu-services');
    const exploreImage = PlaceHolderImages.find(img => img.id === 'mega-menu-explore');
    const supportImage = PlaceHolderImages.find(img => img.id === 'mega-menu-support');

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
        <section className="container pt-20 pb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Analytics & Reporting</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Gain insights into your production efficiency with powerful data visualization and AI-driven analysis.</p>
        </section>

        <section className="container text-center pb-20">
          <Image
            src="/Reports2.png"
            alt="Analytics & Reporting Screenshot"
            width={1200}
            height={675}
            className="rounded-lg shadow-xl mx-auto"
          />
        </section>

        <section className="py-20 bg-muted">
            <div className="container text-center">
                <h2 className="text-3xl font-bold mb-6">What is Analytics & Reporting?</h2>
                <p className="max-w-3xl mx-auto text-muted-foreground mb-8">
                    Data is useless without understanding. AndonPro’s Analytics & Reporting tools transform raw data from your production line into actionable insights. Track key performance indicators (KPIs), visualize downtime by cause, identify recurring bottlenecks, and measure team response times. Our AI helps you spot trends and correlations you might otherwise miss, enabling you to make data-driven decisions for continuous improvement.
                </p>
                <Link href="/pricing" className={cn(buttonVariants({ size: "lg" }))}>
                    Explore Pricing Options <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </div>
        </section>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t bg-primary text-primary-foreground">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose md:text-left">
            Built by you and your AI partner.
          </p>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} AndonPro, Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

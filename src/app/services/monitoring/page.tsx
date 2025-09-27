
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { MegaMenu } from "@/components/layout/mega-menu";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import FooterLogo from "@/components/layout/footer-logo";

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

export default function ProductionMonitoringPage() {
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
                />
                <MegaMenu 
                    triggerText="Support" 
                    items={supportMenuItems}
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Production Monitoring</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Get a live, bird's-eye view of your entire production line. AndonPro's real-time monitoring empowers your team to make informed decisions instantly.</p>
        </section>

        <section className="container text-center pb-20">
          <Image
            src="/Dashboard.png"
            alt="AndonPro Dashboard Screenshot"
            width={1200}
            height={675}
            className="rounded-lg shadow-xl mx-auto"
          />
        </section>

        <section className="py-20 bg-muted">
            <div className="container text-center">
                <h2 className="text-3xl font-bold mb-6">What is Production Monitoring?</h2>
                <p className="max-w-3xl mx-auto text-muted-foreground mb-8">
                    Production Monitoring is the backbone of a smart factory. It involves the continuous tracking and visualization of every workstation's status, ongoing issues, and overall line performance. With AndonPro, you can move from reactive problem-solving to proactive optimization by seeing bottlenecks before they happen, understanding downtime causes, and ensuring your production targets are always within reach.
                </p>
                <Link href="/pricing" className={cn(buttonVariants({ size: "lg" }))}>
                    Explore Pricing Options <ArrowRight className="ml-2 h-5 w-5" />
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

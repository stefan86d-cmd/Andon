
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { MegaMenu } from "@/components/layout/mega-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { buttonVariants } from "@/components/ui/button";
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

export default function OurStoryPage() {
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
        <section className="bg-background">
            <div className="container py-20">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Our Story</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">From the factory floor to your fingertips.</p>
              </div>
            </div>
        </section>
        <section className="bg-muted">
            <div className="container py-20">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                    <h2 className="text-3xl font-semibold">Born from Experience</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        From the heart of Helsinki, Finland, AndonPro was born out of decades of hands-on experience on the factory floor. We're a small, passionate team that has lived and breathed the production environment, witnessing firsthand the communication breakdowns, the costly downtimes, and the daily frustrations that chip away at efficiency.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        We saw a gap. Existing solutions were often overly complex, rigid, and priced out of reach for smaller businesses. We knew there had to be a better way—a tool that was both powerful and accessible. That's why we decided to build AndonPro: an intuitive, affordable platform designed to solve the very issues we faced.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Our core philosophy is simple: empower the user. We believe that the people on the line are the experts, which is why our app is built for ease of use and complete customization. Whether you're a small workshop or a large-scale operation, AndonPro adapts to your unique workflow, not the other way around.
                    </p>
                </div>
                <div>
                    <Image 
                        src="/Helsinki2.jpg"
                        alt="Helsinki cityscape"
                        width={800}
                        height={600}
                        className="rounded-lg shadow-xl"
                        data-ai-hint="Helsinki city"
                    />
                </div>
              </div>
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

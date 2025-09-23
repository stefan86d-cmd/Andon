
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { MegaMenu } from "@/components/layout/mega-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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

const faqs = [
    {
        question: "What is AndonPro?",
        answer: "AndonPro is a modern, intuitive application designed to monitor and manage production line workflows. It allows operators to report issues in real-time from any workstation, which helps teams minimize downtime and improve overall efficiency. Supervisors and administrators get a live overview of the entire production line, can track key performance indicators, and use AI-powered insights to make data-driven decisions."
    },
    {
        question: "What pricing tiers are available?",
        answer: "We offer a range of pricing tiers to fit teams of all sizes. Our plans include a free **Starter** tier for small teams just getting started, a **Standard** tier for growing factories, a **Pro** tier with advanced features like AI-powered analytics and priority support, and an **Enterprise** plan for large-scale operations requiring unlimited resources and dedicated support. You can find detailed information on our <a href='/pricing' class='text-primary underline'>Pricing Page</a>."
    },
    {
        question: "How customizable is the platform?",
        answer: "AndonPro is highly customizable. Administrators can define their own production lines and add, edit, or remove the specific workstations within each line. This ensures that the application's structure perfectly mirrors your factory's layout and workflow. Unlike rigid, off-the-shelf solutions, AndonPro adapts to your environment, not the other way around."
    },
    {
        question: "How does AndonPro use AI?",
        answer: "AndonPro integrates AI to provide intelligent insights and streamline your workflow. When an operator reports an issue, our AI can analyze the description to suggest an appropriate priority level, helping supervisors focus on the most critical problems first. Additionally, our reporting tools use AI to analyze issue data, identify trends, and generate actionable recommendations to help you prevent future downtime."
    }
]

export default function FaqPage() {
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
                                <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
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

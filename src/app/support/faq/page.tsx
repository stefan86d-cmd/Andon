
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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
        answer: "AndonPro is a modern, intuitive application designed to monitor and manage production line workflows. It allows operators to report issues in real-time from any workstation, which helps teams minimize downtime and improve overall efficiency. Supervisors and administrators get a live overview of the entire production line, can track key performance indicators, and use data-driven insights to make decisions."
    },
    {
        question: "What are the different user roles?",
        answer: "AndonPro has three distinct user roles to ensure that team members have access to the features they need: <ul class='list-disc pl-5 space-y-2 mt-2'><li><strong>Admin:</strong> Has full control over the entire system, including user management, production line configuration, billing, and access to all reports and dashboards.</li><li><strong>Supervisor:</strong> Oversees production line operations. They can manage and resolve issues, monitor dashboards, and view reports, but cannot manage users or billing.</li><li><strong>Operator:</strong> Works on the production line. Their primary function is to report issues from their assigned workstation quickly and efficiently.</li></ul>"
    },
    {
        question: "How do I sign up for AndonPro?",
        answer: "You can sign up using your existing Google or Microsoft account for a fast and secure registration process. Alternatively, you can register directly with your email address and create a new password. Simply choose your preferred option on the registration page to get started."
    },
    {
        question: "What pricing tiers are available?",
        answer: "We offer a range of pricing tiers to fit teams of all sizes. Our plans include a free **Starter** tier for small teams, a **Standard** tier for growing factories, a **Pro** tier with advanced features, an **Enterprise** plan for large-scale operations, and a **Custom** plan for unique requirements. You can find detailed information on our <a href='/pricing' class='text-primary underline'>Pricing Page</a>."
    },
    {
        question: "How customizable is the platform?",
        answer: "AndonPro is highly customizable. Administrators can define their own production lines and add, edit, or remove the specific workstations within each line. This ensures that the application's structure perfectly mirrors your factory's layout and workflow. Unlike rigid, off-the-shelf solutions, AndonPro adapts to your environment, not the other way around."
    }
]

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block py-2 text-muted-foreground hover:text-foreground">
        {children}
    </Link>
);


export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <div className="mr-4 flex items-center">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Logo />
                </Link>
                <nav className="hidden md:flex items-center space-x-1 text-sm">
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
            
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0">
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


import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { MegaMenu } from "@/components/layout/mega-menu";
import { buttonVariants } from "@/components/ui/button";
import FooterLogo from "@/components/layout/footer-logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block py-2 text-muted-foreground hover:text-foreground">
        {children}
    </Link>
);


export default function TermsPage() {
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
        <section className="py-20 bg-background">
            <div className="container text-center">
                <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                <p className="text-muted-foreground">Last Updated: September 27, 2025</p>
            </div>
        </section>
        <section className="py-20 bg-muted flex-1">
            <div className="container max-w-4xl mx-auto">
                <div className="prose dark:prose-invert max-w-none">
                    <p>Welcome to AndonPro. These Terms of Service ("Terms") govern your access to and use of the AndonPro application, website, and services (collectively, the "Service"). Please read them carefully.</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>By creating an account or by using our Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use the Service.</p>
                    
                    <h3>2. Use of the Service</h3>
                    <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for all data and information you input into the Service ("User Data") and for any consequences thereof.</p>

                    <h3>3. User Accounts</h3>
                    <p>To use the Service, you must create an account. You are responsible for safeguarding your account password and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. The first user to register for an organization is designated as the "Admin" and is responsible for managing other users within that organization.</p>

                    <h3>4. Subscriptions and Billing</h3>
                    <p>The Service is billed on a subscription basis. You will be billed in advance on a recurring, periodic basis (such as monthly or annually), depending on the subscription plan you select. All subscriptions will automatically renew under the then-current rates unless you cancel your subscription through your account management page.</p>

                    <h3>5. User Data and Intellectual Property</h3>
                    <p>You retain all ownership rights to your User Data. We do not claim any ownership over your data. However, you grant us a worldwide, royalty-free license to use, reproduce, modify, and display the User Data solely for the purpose of providing and improving the Service. Our own materials, including our logo, design, software, and content ("AndonPro IP"), are protected by intellectual property laws and are our exclusive property.</p>

                    <h3>6. Limitation of Liability</h3>
                    <p>To the fullest extent permitted by law, AndonPro shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Service; (b) any conduct or content of any third party on the Service.</p>

                    <h3>7. Termination</h3>
                    <p>We may suspend or terminate your account and access to the Service at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is otherwise harmful to other users of the Service, us, or third parties. You may cancel your account at any time.</p>

                    <h3>8. Governing Law</h3>
                    <p>These Terms shall be governed by the laws of Finland, without respect to its conflict of laws principles.</p>

                    <h3>9. Changes to Terms</h3>
                    <p>We reserve the right to modify these Terms at any time. We will provide notice of any significant changes by posting the new Terms on our site. Your continued use of the Service after any such change constitutes your acceptance of the new Terms.</p>
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
              <p>&copy; {new Date().getFullYear()} AndonPro. All rights reserved.</p>              <nav className="flex justify-center md:justify-end space-x-4 mt-2">
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

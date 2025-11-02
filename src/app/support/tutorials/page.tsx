
"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { MegaMenu } from "@/components/layout/mega-menu";
import { buttonVariants } from "@/components/ui/button";
import { Activity, Edit, PlusCircle, Users, CheckCircle, Menu, LayoutDashboard, Trash2, Factory, Monitor, Truck } from "lucide-react";
import FooterLogo from "@/components/layout/footer-logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
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

const InlineIcon = ({ icon: Icon }: { icon: React.ElementType }) => (
    <Icon className="inline-block h-4 w-4 mr-1.5 -mt-0.5 text-primary" />
);

const Step = ({ children }: { children: React.ReactNode }) => (
    <li className="list-decimal space-y-3">{children}</li>
);

const TutorialVisual = ({ children }: { children: React.ReactNode }) => (
    <div className="my-3 p-4 bg-background/50 border rounded-md">{children}</div>
)

const adminTutorials = [
    {
        icon: Users,
        title: "Adding Users & Assigning Roles",
        content: [
            <>Navigate to the 'User Management' page from the main menu (<InlineIcon icon={Users} />).</>,
            <>Click the 'Add User' button.
                <TutorialVisual>
                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 px-3 bg-primary text-primary-foreground">
                        <PlusCircle className="h-4 w-4 mr-1" /> Add User
                    </div>
                </TutorialVisual>
            </>,
            <>Fill in the new user's first name, last name, and email address.
                 <TutorialVisual>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="text-sm font-medium leading-none">First Name</div>
                            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">John</div>
                        </div>
                         <div className="space-y-2">
                            <div className="text-sm font-medium leading-none">Last Name</div>
                            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">Doe</div>
                        </div>
                    </div>
                     <div className="space-y-2 mt-4">
                        <div className="text-sm font-medium leading-none">Email Address</div>
                        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">john.doe@example.com</div>
                    </div>
                 </TutorialVisual>
            </>,
            <>Select a role from the dropdown menu ('Supervisor' or 'Operator').
                <TutorialVisual>
                     <div className="text-sm font-medium leading-none mb-2">Role</div>
                     <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">Select a role</div>
                </TutorialVisual>
            </>,
            <>Click 'Send Invitation'. The user will receive an email with instructions to set up their account and password.
                 <TutorialVisual>
                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground">Send Invitation</div>
                </TutorialVisual>
            </>
        ]
    },
    {
        icon: Edit,
        title: "Managing Production Lines & Workstations",
        content: [
            <>Navigate to the 'Production Lines' page from the main menu (<InlineIcon icon={Factory} />).</>,
            <>To add a new line, click 'Add Line', enter a unique name, and click 'Save'.
                <TutorialVisual>
                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground">
                        <PlusCircle className="mr-2 h-4 w-4" />Add Line
                    </div>
                </TutorialVisual>
            </>,
            <>To edit an existing line, click the 'Edit' button (<InlineIcon icon={Edit} />) on its card.</>,
            <>In the edit dialog, you can update the line's name and add or remove workstations.
                 <TutorialVisual>
                    <div className="space-y-2">
                        <div className="text-sm font-medium leading-none">Line Name</div>
                        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">Assembly Line 1</div>
                    </div>
                     <div className="space-y-2 mt-4">
                        <div className="text-sm font-medium leading-none">Workstations</div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">Station A</div>
                            <div className="h-10 w-10 inline-flex items-center justify-center"><Trash2 className="h-4 w-4 text-muted-foreground" /></div>
                        </div>
                         <div className="flex items-center gap-2">
                            <div className="flex-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">Station B</div>
                            <div className="h-10 w-10 inline-flex items-center justify-center"><Trash2 className="h-4 w-4 text-muted-foreground" /></div>
                        </div>
                        <div className="h-9 px-3 py-2 inline-flex items-center gap-1 text-muted-foreground">
                            <PlusCircle className="h-4 w-4" /> Add Workstation
                        </div>
                    </div>
                 </TutorialVisual>
            </>,
        ]
    }
];

const supervisorTutorials = [
    {
        icon: CheckCircle,
        title: "Resolving and Updating Issues",
        content: [
            <>Navigate to the 'Issue Tracker' (<InlineIcon icon={Activity} />) or 'Dashboard' (<InlineIcon icon={LayoutDashboard} />) page to see a list of active issues.</>,
            <>Click on any issue row in the table to open the details dialog.</>,
            <>In the dialog, add notes, change the status, and mark if production was stopped.
                 <TutorialVisual>
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="text-sm font-medium leading-none">Resolution Notes</div>
                            <div className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">Technician dispatched...</div>
                        </div>
                        <div className="space-y-2">
                             <div className="text-sm font-medium leading-none">Status</div>
                             <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">In Progress</div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 rounded-sm border border-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-70" />
                            <div className="text-sm font-medium leading-none">Production Stop</div>
                        </div>
                     </div>
                 </TutorialVisual>
            </>,
            <>Click 'Save Changes' to update the issue.
                 <TutorialVisual>
                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground">Save Changes</div>
                </TutorialVisual>
            </>
        ]
    }
];

const operatorTutorials = [
    {
        icon: Activity,
        title: "Selecting Your Station & Reporting an Issue",
        content: [
            <>Navigate to the 'Line Status' page from the main menu (<InlineIcon icon={Activity} />).</>,
            <>Select your current 'Production Line' and 'Workstation'.
                 <TutorialVisual>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">Select Production Line</div>
                        <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">Select Workstation</div>
                    </div>
                 </TutorialVisual>
            </>,
            <>Click 'Confirm Selection' to view issues and enable reporting.
                <TutorialVisual>
                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground">Confirm Selection</div>
                </TutorialVisual>
            </>,
            <>To report a new issue, click the 'Report Issue' button.
                <TutorialVisual>
                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground">
                        <PlusCircle className="mr-2 h-4 w-4" /> Report Issue
                    </div>
                </TutorialVisual>
            </>,
            <>Follow the steps in the dialog: select a category and provide a brief description.
                <TutorialVisual>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-accent text-accent-foreground">
                            <Monitor className="h-12 w-12 mb-2 text-primary" />
                            <p className="text-sm font-medium">IT & Network</p>
                        </div>
                         <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card text-card-foreground">
                            <Truck className="h-12 w-12 mb-2 text-primary" />
                            <p className="text-sm font-medium">Logistics</p>
                        </div>
                    </div>
                </TutorialVisual>
            </>,
            <>Click 'Submit Issue'. Supervisors will be notified instantly.</>
        ]
    }
];

const servicesImage = PlaceHolderImages.find(p => p.id === 'mega-menu-services');
const exploreImage = PlaceHolderImages.find(p => p.id === 'mega-menu-explore');
const supportImage = PlaceHolderImages.find(p => p.id === 'mega-menu-support');

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block py-2 text-muted-foreground hover:text-foreground">
        {children}
    </Link>
);


export default function TutorialsPage() {
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
                <h1 className="text-4xl font-bold mb-4">Tutorials</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Explore step-by-step guides to get the most out of AndonPro.</p>
            </div>
        </section>
        <section className="py-20 bg-muted flex-1">
            <div className="container max-w-4xl mx-auto space-y-12">
                <div>
                    <h2 className="text-2xl font-semibold mb-6 text-center">For Admins</h2>
                    <Accordion type="single" collapsible className="w-full">
                        {adminTutorials.map((tutorial, index) => (
                            <AccordionItem value={`admin-item-${index}`} key={index}>
                                <AccordionTrigger className="text-lg">
                                    <div className="flex items-center gap-3">
                                        <tutorial.icon className="h-5 w-5 text-primary" />
                                        <span>{tutorial.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                                    <ol className="pl-0 space-y-3">
                                        {tutorial.content.map((step, i) => <Step key={i}>{step}</Step>)}
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                 <div>
                    <h2 className="text-2xl font-semibold mb-6 text-center">For Supervisors</h2>
                    <Accordion type="single" collapsible className="w-full">
                        {supervisorTutorials.map((tutorial, index) => (
                            <AccordionItem value={`supervisor-item-${index}`} key={index}>
                                <AccordionTrigger className="text-lg">
                                    <div className="flex items-center gap-3">
                                        <tutorial.icon className="h-5 w-5 text-primary" />
                                        <span>{tutorial.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                                    <ol className="pl-0 space-y-3">
                                        {tutorial.content.map((step, i) => <Step key={i}>{step}</Step>)}
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                <div>
                     <h2 className="text-2xl font-semibold mb-6 text-center">For Operators</h2>
                     <Accordion type="single" collapsible className="w-full">
                        {operatorTutorials.map((tutorial, index) => (
                            <AccordionItem value={`operator-item-${index}`} key={index}>
                                <AccordionTrigger className="text-lg">
                                     <div className="flex items-center gap-3">
                                        <tutorial.icon className="h-5 w-5 text-primary" />
                                        <span>{tutorial.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                                    <ol className="pl-0 space-y-3">
                                        {tutorial.content.map((step, i) => <Step key={i}>{step}</Step>)}
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                 <div className="text-center pt-8">
                    <p className="text-muted-foreground">Still have questions?</p>
                     <Button variant="link" asChild>
                        <Link href="/support/contact">Contact our support team</Link>
                    </Button>
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

    
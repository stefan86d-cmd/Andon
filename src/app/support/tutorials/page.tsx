
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { MegaMenu } from "@/components/layout/mega-menu";
import { buttonVariants } from "@/components/ui/button";
import { Activity, Edit, PlusCircle, Users, CheckCircle, Menu, LayoutDashboard, Trash2 } from "lucide-react";
import FooterLogo from "@/components/layout/footer-logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
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

const InlineIcon = ({ icon: Icon }: { icon: React.ElementType }) => (
    <Icon className="inline-block h-4 w-4 mr-1.5 -mt-0.5 text-primary" />
);

const adminTutorials = [
    {
        icon: Users,
        title: "Adding Users & Assigning Roles",
        content: [
            <>Navigate to the 'User Management' page from the main menu (<InlineIcon icon={Menu} />).</>,
            <>Click the 'Add User' button (<InlineIcon icon={PlusCircle} />) to open the user creation form.</>,
            "Fill in the new user's first name, last name, and email address.",
            "Select a role from the dropdown menu ('Supervisor' or 'Operator').",
            "Click 'Send Invitation'. The user will receive an email with instructions to set up their account and password."
        ]
    },
    {
        icon: Edit,
        title: "Managing Production Lines & Workstations",
        content: [
            <>Navigate to the 'Production Lines' page from the main menu (<InlineIcon icon={Menu} />).</>,
            <>To add a new line, click 'Add Line' (<InlineIcon icon={PlusCircle} />), enter a unique name, and click 'Save'.</>,
            <>To edit an existing line, click the 'Edit' button (<InlineIcon icon={Edit} />) on its card.</>,
            "In the edit dialog, you can update the line's name.",
            <>You can also add new workstations by clicking 'Add Workstation' (<InlineIcon icon={PlusCircle} />) or remove existing ones using the trash icon (<InlineIcon icon={Trash2} />).</>
        ]
    },
    {
        icon: CheckCircle,
        title: "Resolving and Updating Issues",
        content: [
            <>Navigate to the 'Issue Tracker' (<InlineIcon icon={Activity} />) or 'Dashboard' (<InlineIcon icon={LayoutDashboard} />) page to see a list of active issues.</>,
            "Click on any issue row in the table to open the details dialog.",
            "In the dialog, you can add resolution notes to document your progress or solution.",
            "Change the issue's status to 'In Progress' or 'Resolved' using the status dropdown.",
            "Check the 'Production Stop' box if the issue halted production, which is crucial for accurate reporting.",
            "Click 'Save Changes' to update the issue."
        ]
    }
];

const operatorTutorials = [
    {
        icon: Activity,
        title: "Selecting Your Station & Reporting an Issue",
        content: [
            <>Navigate to the 'Line Status' page from the main menu (<InlineIcon icon={Menu} />).</>,
            "First, select your current 'Production Line' from the first dropdown menu.",
            "Next, select your specific 'Workstation' from the second dropdown.",
            "Click 'Confirm Selection' to view issues at your station and enable the reporting button.",
            <>To report a new issue, click the 'Report Issue' button (<InlineIcon icon={PlusCircle} />).</>,
            "Follow the steps in the dialog: select a category, a sub-category (if applicable), and provide a brief description of the problem.",
            "Click 'Submit Issue'. Supervisors will be notified instantly."
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
        <section className="py-20 text-center bg-background">
            <div className="container">
                <h1 className="text-4xl font-bold mb-4">Tutorials</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Explore step-by-step guides to get the most out of AndonPro.</p>
            </div>
        </section>
        <section className="py-20 bg-muted flex-1">
            <div className="container max-w-4xl mx-auto space-y-12">
                <div>
                    <h2 className="text-2xl font-semibold mb-6 text-center">For Admins & Supervisors</h2>
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                        {adminTutorials.map((tutorial, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-lg">
                                    <div className="flex items-center gap-3">
                                        <tutorial.icon className="h-5 w-5 text-primary" />
                                        <span>{tutorial.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                                    <ol className="list-decimal pl-6 space-y-3">
                                        {tutorial.content.map((step, i) => <li key={i}>{step}</li>)}
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                <div>
                     <h2 className="text-2xl font-semibold mb-6 text-center">For Operators</h2>
                     <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                        {operatorTutorials.map((tutorial, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-lg">
                                     <div className="flex items-center gap-3">
                                        <tutorial.icon className="h-5 w-5 text-primary" />
                                        <span>{tutorial.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                                    <ol className="list-decimal pl-6 space-y-3">
                                        {tutorial.content.map((step, i) => <li key={i}>{step}</li>)}
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

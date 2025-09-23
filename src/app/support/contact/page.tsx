
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { MegaMenu } from "@/components/layout/mega-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Building } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export default function ContactPage() {
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
              <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">We're here to help. Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.</p>
            </div>
        </section>

        <section className="py-20 bg-muted">
            <div className="container">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
                            <p className="text-muted-foreground">
                                Have a question or need help? Fill out the form, and we'll get back to you as soon as possible. For specific inquiries, you can also reach us at the email addresses below.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <Mail className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold">Email Us</h3>
                                    <p className="text-muted-foreground text-sm">For sales inquiries:</p>
                                    <a href="mailto:sales@andon.pro" className="text-primary hover:underline">sales@andon.pro</a>
                                    <p className="text-muted-foreground text-sm mt-2">For support:</p>
                                    <a href="mailto:support@andon.pro" className="text-primary hover:underline">support@andon.pro</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Building className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold">Our Office</h3>
                                    <p className="text-muted-foreground">
                                        Mannerheimintie 123<br />
                                        00100 Helsinki, Finland
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Send us a Message</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" placeholder="Your Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder="you@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea id="message" placeholder="How can we help you?" />
                                    </div>
                                    <Button type="submit" className="w-full">Send Message</Button>
                                </form>
                            </CardContent>
                        </Card>
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

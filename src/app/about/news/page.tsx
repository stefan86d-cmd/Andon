
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { MegaMenu } from "@/components/layout/mega-menu";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { format } from "date-fns";
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

const exploreImage = {
    imageUrl: "/Helsinki.jpg",
    description: "Image of Helsinki for explore mega menu",
    imageHint: "Helsinki cityscape",
};

const supportImage = {
    imageUrl: "/Tech_support.jpg",
    description: "Image for support mega menu",
    imageHint: "technical support",
};

export default function NewsPage() {
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
            <div className="container py-20 text-center">
              <h1 className="text-4xl font-bold mb-4">Latest News</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">Read the latest product announcements and company news.</p>
            </div>
        </section>
        <section className="bg-muted">
          <div className="container py-20">
            <article className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">AndonPro Has Officially Launched!</h2>
                <p className="text-muted-foreground mt-2">Published on September 27, 2025</p>
              </div>
              <div className="flex justify-center mb-8">
                <Image 
                  src="/Andonpro_Logo_Musta_Syvätty.png"
                  alt="AndonPro Logo"
                  width={300}
                  height={72}
                  className="rounded-lg"
                />
              </div>
              <div className="prose prose-lg dark:prose-invert mx-auto">
                <p>
                  After months of hard work, it's finally here! I am thrilled to announce that the AndonPro app has officially launched and is ready for customers. This marks a significant milestone in my journey to revolutionize production line management and make powerful, intuitive tools accessible to everyone.
                </p>
                <p>
                  I can't wait for you to experience the difference AndonPro can make.
                </p>
                 <div className="not-prose text-center mt-12">
                    <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
                        Get Started Now
                    </Link>
                </div>
              </div>
            </article>
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

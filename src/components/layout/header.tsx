import { Bell, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/layout/user-nav";
import Link from "next/link";
import { SidebarNav } from "./sidebar-nav";
import { users } from "@/lib/data";
import { Logo } from "./logo";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
    isCollapsed: boolean;
}

export function Header({ isCollapsed }: HeaderProps) {
  const currentUser = users.current;
  const isMobile = useIsMobile();
  
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      {!isMobile && <div className="w-[36px] shrink-0"></div>}
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
              <SidebarNav isMobile={true} userRole={currentUser.role} />
          </SheetContent>
        </Sheet>
      )}
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo />
      </Link>

      <div className="w-full flex-1" />

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Toggle notifications</span>
         <Badge className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-4 w-4 shrink-0 items-center justify-center rounded-full p-0 text-xs font-medium">3</Badge>
      </Button>
      <UserNav />
    </header>
  );
}

import { Bell, Search, PanelLeft, PanelRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/layout/user-nav";
import Link from "next/link";
import { SidebarNav } from "./sidebar-nav";
import { users } from "@/lib/data";
import { Logo } from "./logo";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
    onMenuClick: () => void;
    isCollapsed: boolean;
}

export function Header({ onMenuClick, isCollapsed }: HeaderProps) {
  const currentUser = users.current;
  const isMobile = useIsMobile();
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Logo />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
              <SidebarNav isMobile={true} userRole={currentUser.role} />
          </SheetContent>
        </Sheet>
      ) : (
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="hidden md:flex">
            {isCollapsed ? <PanelRight /> : <PanelLeft />}
            <span className="sr-only">Toggle sidebar</span>
        </Button>
      )}

      <div className="w-full flex-1">
        {currentUser.role === 'admin' && (
          <form>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search issues..."
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
              />
            </div>
          </form>
        )}
      </div>
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Toggle notifications</span>
         <Badge className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-4 w-4 shrink-0 items-center justify-center rounded-full p-0 text-xs font-medium">3</Badge>
      </Button>
      <UserNav />
    </header>
  );
}

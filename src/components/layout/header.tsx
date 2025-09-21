
import { Bell, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/layout/user-nav";
import Link from "next/link";
import { SidebarNav } from "./sidebar-nav";
import { Logo } from "./logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/user-context";

interface HeaderProps {
    isCollapsed: boolean;
}

export function Header({ isCollapsed }: HeaderProps) {
  const { currentUser } = useUser();
  const isMobile = useIsMobile();
  // const newIssuesCount = issues.filter(issue => issue.status === 'reported').length;

  const capitalize = (s: string) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
              {currentUser && <SidebarNav isMobile={true} userRole={currentUser.role} />}
          </SheetContent>
        </Sheet>
      ) : (
        // Placeholder for non-mobile to keep spacing consistent
        <div />
      )}
      
      <div className="w-full flex-1" />

      {currentUser && currentUser.role !== 'operator' && (
        <Link href="/issues">
            <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
            {/* {newIssuesCount > 0 && (
                <Badge className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-4 w-4 shrink-0 items-center justify-center rounded-full p-0 text-xs font-medium">{newIssuesCount}</Badge>
            )} */}
            </Button>
        </Link>
      )}
      {currentUser && (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">{capitalize(currentUser.role)}</span>
            <UserNav />
        </div>
      )}
    </header>
  );
}

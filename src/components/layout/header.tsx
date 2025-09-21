
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import Link from "next/link";
import { SidebarNav } from "./sidebar-nav";
import { Logo } from "./logo";
import { useUser } from "@/contexts/user-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { currentUser } = useUser();

  const capitalize = (s: string) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {currentUser && <SidebarNav userRole={currentUser.role} />}
        </DropdownMenuContent>
      </DropdownMenu>

      <Link href="/">
          <Logo />
      </Link>
      
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

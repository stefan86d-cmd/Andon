
import { SidebarNav } from "./sidebar-nav";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";
import { Logo } from "./logo";

interface SidebarProps {
  isCollapsed: boolean;
  onMenuClick: () => void;
}

export function Sidebar({ isCollapsed, onMenuClick }: SidebarProps) {
  const { currentUser } = useUser();
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className={cn("flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6", isCollapsed ? "justify-center" : "justify-between")}>
          <Link href="/" className={cn("flex items-center gap-2 font-semibold", isCollapsed && "hidden")}>
            <Logo />
          </Link>
          <Button variant="outline" size="icon" onClick={onMenuClick} className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
        <div className="flex-1">
            {currentUser && <SidebarNav userRole={currentUser.role} isCollapsed={isCollapsed} />}
        </div>
      </div>
    </div>
  );
}

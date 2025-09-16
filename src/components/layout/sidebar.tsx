import Link from "next/link";
import { SidebarNav } from "./sidebar-nav";
import { users } from "@/lib/data";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { HardHat, LayoutDashboard } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const currentUser = users.current;
  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className={cn("flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6", isCollapsed && "px-2 justify-center")}>
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Button variant="ghost" size="icon">
                <LayoutDashboard className="h-6 w-6" />
            </Button>
            <span className="sr-only">AndonPro Home</span>
          </Link>
        </div>
        <div className="flex-1">
            <SidebarNav userRole={currentUser.role} isCollapsed={isCollapsed} />
        </div>
      </div>
    </div>
  );
}

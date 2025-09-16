import { SidebarNav } from "./sidebar-nav";
import { users } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onMenuClick: () => void;
}

export function Sidebar({ isCollapsed, onMenuClick }: SidebarProps) {
  const currentUser = users.current;
  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className={cn("flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6", isCollapsed && "px-2 justify-center")}>
          <Button variant="outline" size="icon" onClick={onMenuClick} className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
        <div className="flex-1">
            <SidebarNav userRole={currentUser.role} isCollapsed={isCollapsed} />
        </div>
      </div>
    </div>
  );
}

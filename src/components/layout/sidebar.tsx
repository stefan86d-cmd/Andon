
import { SidebarNav } from "./sidebar-nav";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";
import { Logo } from "./logo";

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const { currentUser } = useUser();
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          {/* This space is intentionally left blank as the logo and button are in the header now */}
        </div>
        <div className="flex-1">
            {currentUser && <SidebarNav userRole={currentUser.role} isCollapsed={isCollapsed} />}
        </div>
      </div>
    </div>
  );
}

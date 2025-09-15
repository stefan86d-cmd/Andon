import Link from "next/link";
import { Package2 } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar() {
  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6 text-primary" />
            <span className="">AndonPro</span>
          </Link>
        </div>
        <div className="flex-1">
            <SidebarNav />
        </div>
      </div>
    </div>
  );
}

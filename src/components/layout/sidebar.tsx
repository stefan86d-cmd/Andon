import Link from "next/link";
import { SidebarNav } from "./sidebar-nav";
import { users } from "@/lib/data";
import { Logo } from "./logo";

export function Sidebar() {
  const currentUser = users.current;
  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
        <div className="flex-1">
            <SidebarNav userRole={currentUser.role} />
        </div>
      </div>
    </div>
  );
}

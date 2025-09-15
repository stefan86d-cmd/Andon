
"use client"
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Package2,
  HardHat,
  Bell,
} from "lucide-react";
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/issues", icon: HardHat, label: "Issues", badge: "27" },
    { href: "/reports", icon: BarChart3, label: "Reports" },
    { href: "/settings", icon: Settings, label: "Settings" },
]

export function SidebarNav({ isMobile = false }: { isMobile?: boolean }) {
    const pathname = usePathname()

    return (
        <nav className={cn("grid items-start px-2 text-sm font-medium lg:px-4", isMobile && "px-4" )}>
            {isMobile && <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
              <Package2 className="h-6 w-6 text-primary" />
              <span className="sr-only">Andon Assistant</span>
            </Link>}
            {navItems.map(({ href, icon: Icon, label, badge }) => (
                <Link
                    key={href}
                    href={href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        pathname === href && "bg-muted text-primary"
                    )}
                >
                    <Icon className="h-4 w-4" />
                    {label}
                    {badge && <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{badge}</Badge>}
                </Link>
            ))}
        </nav>
    )
}

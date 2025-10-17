
"use client"
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Factory,
  Activity,
  Settings,
} from "lucide-react";
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";
import { DropdownMenuItem } from "../ui/dropdown-menu";


const allNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ['admin', 'supervisor'] },
    { href: "/line-status", icon: Activity, label: "Line Status", roles: ['operator'] },
    { href: "/issues", icon: Activity, label: "Issue Tracker", roles: ['admin', 'supervisor'] },
    { href: "/lines", icon: Factory, label: "Production Lines", roles: ['admin'] },
    { href: "/users", icon: Users, label: "User Management", roles: ['admin'] },
    { href: "/reports", icon: BarChart3, label: "Reports", roles: ['admin', 'supervisor'] },
    { href: "/settings", icon: Settings, label: "Settings", roles: ['admin', 'supervisor', 'operator'] },
]

interface SidebarNavProps {
    userRole: Role;
    className?: string;
    isMobile?: boolean;
}

export function SidebarNav({ userRole, className, isMobile }: SidebarNavProps) {
    const pathname = usePathname()
    const navItems = allNavItems.filter(item => item.roles.includes(userRole));

    if (isMobile) {
        return (
            <nav className="grid items-start text-sm font-medium">
                {navItems.map(({ href, icon: Icon, label }) => (
                    <Link key={href} href={href}>
                        <DropdownMenuItem
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                                pathname.startsWith(href) && href !== "/" && "font-semibold text-foreground bg-accent",
                                pathname === "/" && href === "/" && "font-semibold text-foreground bg-accent"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                        </DropdownMenuItem>
                    </Link>
                ))}
            </nav>
        );
    }

    return (
        <nav className={cn("hidden md:flex md:items-center md:gap-5 lg:gap-6 text-sm font-medium", className)}>
            {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                    key={href}
                    href={href}
                    className={cn(
                        "flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground",
                         pathname.startsWith(href) && href !== "/" && "text-foreground",
                         pathname === "/" && href === "/" && "text-foreground"
                    )}
                >
                   <span>{label}</span>
                </Link>
            ))}
        </nav>
    )
}

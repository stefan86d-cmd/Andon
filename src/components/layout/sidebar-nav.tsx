
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
}

export function SidebarNav({ userRole }: SidebarNavProps) {
    const pathname = usePathname()
    const navItems = allNavItems.filter(item => item.roles.includes(userRole));

    return (
        <nav className="grid items-start text-sm font-medium">
            {navItems.map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href}>
                    <DropdownMenuItem
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname.startsWith(href) && href !== "/" && "font-semibold text-foreground",
                            pathname === "/" && href === "/" && "font-semibold text-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                    </DropdownMenuItem>
                </Link>
            ))}
        </nav>
    )
}

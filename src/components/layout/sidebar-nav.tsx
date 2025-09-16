"use client"
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Users,
  Factory,
  Activity,
} from "lucide-react";
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import type { Role } from "@/lib/types";
import { Logo } from "./logo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const allNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ['admin'] },
    { href: "/dashboard", icon: Activity, label: "Line Status", roles: ['operator'] },
    { href: "/issues", icon: Activity, label: "All Issues", badge: "27", roles: ['admin'] },
    { href: "/lines", icon: Factory, label: "Production Lines", roles: ['admin'] },
    { href: "/users", icon: Users, label: "User Management", roles: ['admin'] },
    { href: "/reports", icon: BarChart3, label: "Reports", roles: ['admin'] },
    { href: "/settings", icon: Settings, label: "Settings", roles: ['admin', 'operator'] },
]

interface SidebarNavProps {
    isMobile?: boolean;
    isCollapsed?: boolean;
    userRole: Role;
}

export function SidebarNav({ isMobile = false, isCollapsed = false, userRole }: SidebarNavProps) {
    const pathname = usePathname()
    const navItems = allNavItems.filter(item => item.roles.includes(userRole));

    return (
        <TooltipProvider>
            <nav className={cn("grid items-start text-sm font-medium", isMobile ? "px-4" : "px-2 lg:px-4", isCollapsed && !isMobile && "px-2")}>
                {isMobile && 
                <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Logo />
                <span className="sr-only">AndonPro</span>
                </Link>
                }
                {navItems.map(({ href, icon: Icon, label, badge }) => { 
                    const linkContent = (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                pathname === href && "bg-muted text-primary",
                                isCollapsed && !isMobile && "justify-center"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span className={cn("truncate", isCollapsed && !isMobile && "sr-only")}>{label}</span>
                            {badge && !isCollapsed && <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{badge}</Badge>}
                        </Link>
                    )
                    
                    if (isCollapsed && !isMobile) {
                        return (
                            <Tooltip key={href}>
                                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                                <TooltipContent side="right">{label}</TooltipContent>
                            </Tooltip>
                        )
                    }
                    return linkContent;
                })}
            </nav>
        </TooltipProvider>
    )
}

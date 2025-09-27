
"use client"

import * as React from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface MegaMenuItem {
    title: string;
    description: string;
    badge: string;
    href: string;
}

interface MegaMenuProps {
    triggerText: string;
    items: MegaMenuItem[];
    image?: {
        imageUrl: string;
        description: string;
        imageHint: string;
    };
}

export function MegaMenu({ triggerText, items, image }: MegaMenuProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-transparent data-[state=open]:bg-transparent hover:bg-transparent">
            {triggerText}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className={cn("grid gap-4 p-4 md:w-[500px] lg:w-[600px]", image && "md:grid-cols-2")}>
              <ul className="grid gap-3">
                {items.map((item) => (
                  <ListItem
                    key={item.title}
                    title={item.title}
                    href={item.href}
                    badge={item.badge}
                  >
                    {item.description}
                  </ListItem>
                ))}
              </ul>
               {image && (
                <div className="relative h-full min-h-[200px] w-full overflow-hidden rounded-md">
                    <Image
                        src={image.imageUrl}
                        alt={image.description}
                        data-ai-hint={image.imageHint}
                        fill
                        className="object-cover"
                    />
                </div>
              )}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string; badge?: string }
>(({ className, title, children, badge, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
            <div className="flex items-center gap-2">
                <div className="text-sm font-medium leading-none">{title}</div>
                {badge && <Badge variant="secondary">{badge}</Badge>}
            </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"


"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

// ---------------------
// Tabs Root
// ---------------------
const Tabs = TabsPrimitive.Root

// ---------------------
// Tabs List
// ---------------------
interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  orientation?: "horizontal" | "vertical"
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    orientation={orientation}
    className={cn(
      "inline-flex h-auto items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      orientation === "vertical" &&
        "flex-col h-full bg-transparent p-0 border-r",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

// ---------------------
// Tabs Trigger
// ---------------------
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = "TabsTrigger"

// ---------------------
// Tabs Content
// ---------------------
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = "TabsContent"

// ---------------------
// Export all
// ---------------------
export { Tabs, TabsList, TabsTrigger, TabsContent }

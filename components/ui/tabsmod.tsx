"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

// Tabs Root with flex flex-col gap-2
const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React. ComponentPropsWithoutRef<typeof TabsPrimitive.  Root>
>(({ className, ... props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    data-slot="tabs"
    className={cn("flex flex-col gap-2", className)}
    {...props}
  />
))
Tabs.displayName = "Tabs"

// TabsList with border-bottom style (không có background muted)
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React. ComponentPropsWithoutRef<typeof TabsPrimitive. List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-slot="tabs-list"
    className={cn(
      "border-b text-sm font-medium border-muted-foreground/50 flex px-2 gap-x-3",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

// TabsTrigger with bottom border underline style
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive. Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive. Trigger
    ref={ref}
    data-slot="tabs-trigger"
    className={cn(
      "data-[state=active]:shadow-none px-2 data-[state=active]:text-foreground text-foreground/70",
      "border-b-2 border-transparent data-[state=active]: border-primary py-3",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:  not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = "TabsTrigger"

// TabsContent with flex-1 outline-none
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React. ComponentPropsWithoutRef<typeof TabsPrimitive. Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-slot="tabs-content"
    className={cn("flex-1 outline-none", className)}
    {...props}
  />
))
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
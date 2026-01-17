"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"

// Root Combobox Component
interface ComboboxContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  onValueChange: (value: string) => void
  searchValue: string
  setSearchValue: (value: string) => void
}

const ComboboxContext = React.createContext<ComboboxContextValue | undefined>(undefined)

const useCombobox = () => {
  const context = React.useContext(ComboboxContext)
  if (!context) {
    throw new Error("Combobox components must be used within Combobox")
  }
  return context
}

interface ComboboxProps {
  value?:  string
  onValueChange?: (value: string) => void
  open?: boolean
  onOpenChange?:  (open: boolean) => void
  defaultOpen?: boolean
  children: React.ReactNode
}

const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  ({ value: controlledValue, onValueChange, open:  controlledOpen, onOpenChange, defaultOpen = false, children }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
    const [internalValue, setInternalValue] = React.useState("")
    const [searchValue, setSearchValue] = React.useState("")

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = onOpenChange || setInternalOpen

    const value = controlledValue !== undefined ? controlledValue : internalValue
    const setValue = onValueChange || setInternalValue

    return (
      <ComboboxContext.Provider
        value={{
          open,
          setOpen,
          value,
          onValueChange: setValue,
          searchValue,
          setSearchValue,
        }}
      >
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
          <div ref={ref} data-slot="combobox">
            {children}
          </div>
        </PopoverPrimitive.Root>
      </ComboboxContext.Provider>
    )
  }
)
Combobox.displayName = "Combobox"

// ComboboxAnchor
interface ComboboxAnchorProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const ComboboxAnchor = React.forwardRef<HTMLDivElement, ComboboxAnchorProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="combobox-anchor"
        className={cn("w-[200px]", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ComboboxAnchor.displayName = "ComboboxAnchor"

// ComboboxTrigger
interface ComboboxTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const ComboboxTrigger = React.forwardRef<HTMLButtonElement, ComboboxTriggerProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button"
    const buttonProps = asChild ? {} : props

    return (
      <PopoverPrimitive.Trigger asChild={asChild}>
        <Comp
          ref={ref}
          data-slot="combobox-trigger"
          className={cn("", className)}
          tabIndex={0}
          {...buttonProps}
        >
          {children}
        </Comp>
      </PopoverPrimitive.Trigger>
    )
  }
)
ComboboxTrigger.displayName = "ComboboxTrigger"

// ComboboxCancel - Programmatically close the combobox
const ComboboxCancel = React. forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const { setOpen } = useCombobox()
  
  return (
    <button
      ref={ref}
      onClick={(e) => {
        setOpen(false)
        onClick?.(e)
      }}
      {... props}
    />
  )
})
ComboboxCancel.displayName = "ComboboxCancel"

// ComboboxList (Content + Portal)
interface ComboboxListProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  children: React. ReactNode
}

const ComboboxList = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  ComboboxListProps
>(({ className, children, align = "center", sideOffset = 4, ...props }, ref) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        data-slot="combobox-list"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-[200px] rounded-md border bg-popover text-popover-foreground overflow-hidden shadow-md outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]: zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]: slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        <CommandPrimitive>{children}</CommandPrimitive>
      </PopoverPrimitive. Content>
    </PopoverPrimitive.Portal>
  )
})
ComboboxList.displayName = "ComboboxList"

// ComboboxInput
interface ComboboxInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onValueChange'> {
  displayValue?: (value: string) => string
  value?: string
  onValueChange?: (value: string) => void
}

const ComboboxInput = React.forwardRef<HTMLInputElement, ComboboxInputProps>(
  ({ className, displayValue, value:  propValue, onValueChange:  propOnValueChange, ...props }, ref) => {
    const context = useCombobox()
    const searchValue = propValue !== undefined ? propValue : context.searchValue
    const setSearchValue = propOnValueChange || context.setSearchValue

    return (
      <div data-slot="command-input-wrapper" className="flex h-9 items-center gap-2 border-b px-3">
        <Search className="size-4 shrink-0 opacity-50" />
        <CommandPrimitive.Input
          ref={ref}
          data-slot="command-input"
          value={searchValue}
          onValueChange={setSearchValue}
          className={cn(
            "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none",
            "disabled:cursor-not-allowed disabled: opacity-50",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
ComboboxInput.displayName = "ComboboxInput"

// ComboboxViewport
interface ComboboxViewportProps extends React. HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const ComboboxViewport = React.forwardRef<HTMLDivElement, ComboboxViewportProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="combobox-viewport"
        className={cn("max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ComboboxViewport.displayName = "ComboboxViewport"

// ComboboxEmpty
interface ComboboxEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const ComboboxEmpty = React.forwardRef<HTMLDivElement, ComboboxEmptyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <CommandPrimitive.Empty
        ref={ref}
        data-slot="combobox-empty"
        className={cn("py-6 text-center text-sm", className)}
        {...props}
      >
        {children}
      </CommandPrimitive. Empty>
    )
  }
)
ComboboxEmpty.displayName = "ComboboxEmpty"

// ComboboxGroup
interface ComboboxGroupProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> {
  heading?: string
}

const ComboboxGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  ComboboxGroupProps
>(({ className, heading, children, ...props }, ref) => {
  return (
    <CommandPrimitive.Group
      ref={ref}
      data-slot="combobox-group"
      className={cn("overflow-hidden p-1 text-foreground", className)}
      {...props}
    >
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {heading}
        </div>
      )}
      {children}
    </CommandPrimitive.Group>
  )
})
ComboboxGroup.displayName = "ComboboxGroup"

// ComboboxItem
interface ComboboxItemProps extends React. ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  children:  React.ReactNode
}

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive. Item>,
  ComboboxItemProps
>(({ className, value, onSelect, children, ...props }, ref) => {
  const { onValueChange, setOpen } = useCombobox()

  return (
    <CommandPrimitive.Item
      ref={ref}
      data-slot="combobox-item"
      value={value}
      onSelect={(selectedValue) => {
        onValueChange(selectedValue)
        setOpen(false)
        onSelect?.(selectedValue)
      }}
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
        "[&_svg: not([class*='text-'])]:text-muted-foreground",
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg: not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
    </CommandPrimitive.Item>
  )
})
ComboboxItem.displayName = "ComboboxItem"

// ComboboxItemIndicator
interface ComboboxItemIndicatorProps extends React. HTMLAttributes<HTMLSpanElement> {
  children?:  React.ReactNode
}

const ComboboxItemIndicator = React.forwardRef<HTMLSpanElement, ComboboxItemIndicatorProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        data-slot="combobox-item-indicator"
        className={cn("ml-auto", className)}
        {...props}
      >
        {children || <Check className="h-4 w-4" />}
      </span>
    )
  }
)
ComboboxItemIndicator.displayName = "ComboboxItemIndicator"

// ComboboxSeparator
interface ComboboxSeparatorProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> {}

const ComboboxSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  ComboboxSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <CommandPrimitive. Separator
      ref={ref}
      data-slot="combobox-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
})
ComboboxSeparator.displayName = "ComboboxSeparator"

export {
  Combobox,
  ComboboxAnchor,
  ComboboxTrigger,
  ComboboxCancel,
  ComboboxList,
  ComboboxInput,
  ComboboxViewport,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxSeparator,
}
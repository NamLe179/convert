"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd"; 

interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode; 
}

export default function CommandPaletteDialog({
  open,
  onOpenChange,
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 top-14 translate-y-0 sm:max-w-[600px]">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {/* Slot content */}
        {children}

        <footer className="p-2 bg-accent/40 text-sm text-muted-foreground flex items-center gap-1 sm:justify-start">
          Type <Kbd>@</Kbd> for place name search, <Kbd>&gt;</Kbd> or <Kbd>#</Kbd> for actions
        </footer>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Kế thừa props từ CMDK Input,  bắt buộc có value và onValueChange để kiểm soát logic Escape
interface Props extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {
  value: string;
  onValueChange: (value: string) => void;
}

const CommandPaletteInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  Props
>(({ className, value, onValueChange, onKeyDown, ...props }, ref) => {
  
  // Logic xử lý phím Escape giống phiên bản Vue
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (value.length > 0) {
        // Nếu đang có chữ, xóa chữ và ngăn sự kiện để không đóng Dialog
        e.preventDefault();
        onValueChange("");
        return;
      }
    }
    onKeyDown?.(e);
  };

  return (
    <div className="flex h-12 items-center gap-2 border-b px-3" cmdk-input-wrapper="">
      <Search className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        ref={ref}
        value={value}
        onValueChange={onValueChange}
        autoFocus
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onKeyDown={handleKeyDown}
        {...props}
      />
    </div>
  );
});

CommandPaletteInput.displayName = "CommandPaletteInput";

export default CommandPaletteInput;
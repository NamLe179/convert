"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

// Kế thừa HTMLAttributes để nhận id, className, style... giống cơ chế Fallthrough của Vue
interface Props extends HTMLAttributes<HTMLElement> {
  onCancel: () => void;
  submitText?: string;
}

export default function FormFooter({
  onCancel,
  submitText = "Save",
  className,
  ...props // Hứng các props còn lại 
}: Props) {
  return (
    <footer
      className={cn("mt-4 flex justify-end items-center gap-1", className)}
      {...props} // Spread id và các attribute khác vào thẻ footer
    >
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onCancel} 
        type="button"
      >
        Cancel
      </Button>
      
      <Button 
        size="sm" 
        type="submit"
      >
        {submitText}
      </Button>
    </footer>
  );
}
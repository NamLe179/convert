import { X } from "lucide-react";
import { cn } from "@/lib/utils"; 
import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {}

export default function CloseButton({ className, ...props }: Props) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
        className
      )}
      {...props}
    >
      <X className="w-5 h-5" />
      <span className="sr-only">Close</span>
    </button>
  );
}
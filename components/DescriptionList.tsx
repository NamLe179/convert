import { cn } from "@/lib/utils";
import { type ReactNode, type HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function DescriptionList({ children, className, ...props }: Props) {
  return (
    <div 
      className={cn("mt-4 border-t border-t-border", className)} 
      {...props}
    >
      <dl className="divide-y divide-border">
        {children}
      </dl>
    </div>
  );
}
import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export default function SectionGrid({ className, children, ...props }: Props) {
  return (
    <section
      className={cn(
        "grid w-full grid-cols-[10ch_1fr] gap-3 pb-1 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItemProps {
  label: string;
  children: ReactNode;
  className?: string; // Tương đương tabClass
  isActive?: boolean; // Prop này sẽ được TabView tự động truyền vào
}

export default function TabItem({
  children,
  className,
  isActive,
}: TabItemProps) {
  return (
    <div
      className={cn(
        "mt-6",
        className,
        // Nếu không active thì ẩn đi (thay thế cho v-show)
        !isActive && "hidden"
      )}
    >
      {children}
    </div>
  );
}
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface Props {
  label: string | ReactNode;
  
  // Vue prop: ddClass
  ddClass?: string;
  
  // Vue default slot <slot />
  children?: ReactNode;
}

export default function DescriptionItem({ label, ddClass, children }: Props) {
  return (
    <div className="px-0 py-4">
      <dt className="text-sm font-semibold">
        {label}
      </dt>
      <dd className={cn("mt-1 text-sm", ddClass)}>
        {children}
      </dd>
    </div>
  );
}
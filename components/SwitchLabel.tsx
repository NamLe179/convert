"use client";

import { useId, type ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  // children tương đương với <slot />
  children: ReactNode;
}

export default function SwitchLabel({ 
  checked, 
  onCheckedChange, 
  children 
}: Props) {
  // Tạo ID duy nhất, an toàn cho SSR thay vì dùng nanoid
  const id = useId();

  return (
    <div className="flex items-center gap-2">
      <Switch 
        id={id} 
        checked={checked} 
        onCheckedChange={onCheckedChange} 
      />
      {/* htmlFor thay cho for trong JSX */}
      <Label htmlFor={id} className="cursor-pointer">
        {children}
      </Label>
    </div>
  );
}
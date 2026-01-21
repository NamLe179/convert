"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MsdlEnumItem } from "@orbat-mapper/msdllib";

interface Props {
  values: MsdlEnumItem[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function EnumSelect({ 
  values, 
  value, 
  onValueChange,
  placeholder = "" 
}: Props) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Values</SelectLabel>
          {values.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
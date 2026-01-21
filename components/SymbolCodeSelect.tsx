"use client";

import { useId, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import MilSymbol from "@/components/MilSymbol"; 

export interface NullableSymbolItem {
  code: string | null;
  sidc: string;
  text: string;
}

interface Props {
  label?: string;
  items: NullableSymbolItem[];
  placeholder?: string;
  value?: string | null;
  onValueChange?: (value: string) => void;
}

export default function SymbolCodeSelect({
  label,
  items,
  placeholder,
  value = "A", // Default value tương đương default trong Vue defineModel
  onValueChange,
}: Props) {
  const controlId = useId();

  // Tìm item đang được chọn để render custom trigger
  const selected = useMemo(() => {
    return (items || []).find((i) => i.code === value);
  }, [items, value]);

  const handleValueChange = (val: string) => {
    if (onValueChange) {
      onValueChange(val);
    }
  };

  return (
    <div>
      <Label htmlFor={controlId}>{label}</Label>
      
      <Select value={value || ""} onValueChange={handleValueChange}>
        <SelectTrigger 
          id={controlId} 
          className="mt-2 w-full h-auto py-1" 
        >
          {/* Custom Rendering cho Trigger */}
          {selected ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <MilSymbol
                className="size-8 shrink-0"
                sidc={selected.sidc || ""}
                size={20}
                modifiers={{
                  outlineWidth: 8,
                }}
              />
              <span className="truncate">{selected.text}</span>
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>

        <SelectContent className="border-border">
          <SelectGroup>
            {items.map((item) => (
              <SelectItem
                key={item.code ?? "null-key"}
                value={item.code || ""} 
                className="data-[state=checked]:font-semibold"
              >
                <div className="flex items-center gap-2">
                  <MilSymbol
                    size={20}
                    className="size-8 shrink-0"
                    sidc={item.sidc}
                    modifiers={{
                      outlineWidth: 8,
                    }}
                  />
                  <span>{item.text}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
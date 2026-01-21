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
  sidc: string;
  code: string | null;
  entity?: string | null;
  entityType?: string | null;
  entitySubtype?: string | null;
}

interface Props {
  label?: string;
  items: NullableSymbolItem[];
  placeholder?: string;
  value?: string | null;
  onValueChange?: (value: string) => void;
}

// Helper function để map dữ liệu hiển thị
function mapSymbolItem(item: NullableSymbolItem) {
  return {
    sidc: item.sidc,
    code: item.code,
    label: item.entitySubtype || item.entityType || item.entity || "",
    subLabel: item.entitySubtype
      ? `${item.entity} / ${item.entityType}`
      : item.entityType
      ? item.entity
      : "",
  };
}

export default function SymbolCodeMultilineSelect({
  label,
  items,
  placeholder,
  value = "------", // Default value
  onValueChange,
}: Props) {
  const controlId = useId();

  // 1. Memoize danh sách hiển thị
  const renderedItems = useMemo(() => items.map(mapSymbolItem), [items]);

  // 2. Memoize item đang được chọn
  const selected = useMemo(() => {
    const found = renderedItems.find((i) => i.code === value);
    // Logic Vue: Nếu không tìm thấy value hiện tại, fallback về phần tử đầu tiên
    return found ? found : renderedItems[0];
  }, [renderedItems, value]);

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
          className="mt-2 w-full h-auto py-2 items-start"
        >
          {/* Custom Trigger Rendering */}
          {selected ? (
            <div className="flex items-center text-left w-full">
              <MilSymbol
                className="size-8 shrink-0"
                sidc={selected.sidc || ""}
                size={20}
                modifiers={{
                  outlineWidth: 4,
                }}
              />
              <div className="ml-3 max-w-xs sm:max-w-none overflow-hidden">
                {selected.subLabel && (
                  <div className="text-muted-foreground truncate text-xs">
                    {selected.subLabel}
                  </div>
                )}
                <div className="mt-0 truncate text-sm font-medium">
                  {selected.label}
                </div>
              </div>
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {renderedItems.map((item) => (
              <SelectItem
                key={item.code ?? "null-key"}
                value={item.code || ""}
                className="data-[state=checked]:font-semibold py-2"
              >
                <div className="flex items-center w-full">
                  <MilSymbol
                    className="size-8 shrink-0"
                    sidc={item.sidc || ""}
                    size={20}
                    modifiers={{
                      outlineWidth: 4,
                    }}
                  />
                  <div className="ml-3 flex-auto text-left max-w-[200px] sm:max-w-none overflow-hidden">
                    {item.subLabel && (
                      <div className="text-muted-foreground truncate text-xs">
                        {item.subLabel}
                      </div>
                    )}
                    <div className="mt-0 truncate text-sm">
                      {item.label}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
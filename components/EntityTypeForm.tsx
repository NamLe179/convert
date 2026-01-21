"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useEntityTypeSelectors } from "@/stores/entityTypeStore"; 

// Types
type Enumeration = {
  title: string;
  value: number;
};

// Các key khớp với thuộc tính trả về từ useEntityTypeSelectors
type LabelType = "Country" | "Kind" | "Domain" | "Category" | "Subcategory" | "Specific" | "Extra";

interface Props {
  label: LabelType; // Chặt chẽ hơn string
  value: number | null;
  onChange: (value: number | null) => void;
  updateMethod: () => void;
}

export default function EntityCombobox({ label, value, onChange, updateMethod }: Props) {
  const [open, setOpen] = React.useState(false);
  
  // Dùng selector hook để lấy dữ liệu đã được format 
  const selectors = useEntityTypeSelectors();
  
  // Mapping data dựa trên selectors
  const itemsMap: Record<LabelType, Enumeration[]> = {
    Country: selectors.countries,
    Kind: selectors.kinds,
    Domain: selectors.domains,
    Category: selectors.categories,
    Subcategory: selectors.subcategories,
    Specific: selectors.specifics,
    Extra: selectors.extras,
  };

  // Lấy danh sách item tương ứng với label hiện tại 
  const currentItems = itemsMap[label] || [];

  // Tìm item đang được chọn để hiển thị label trên nút bấm
  const selectedItem = React.useMemo(() => {
    return currentItems.find((item) => item.value === value);
  }, [currentItems, value]);

  const handleSelect = (currentValue: number) => {
    onChange(currentValue === value ? null : currentValue);
    updateMethod(); 
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="justify-between font-light size-full whitespace-normal text-left"
        >
          {selectedItem
            ? selectedItem.title
            : `Unknown ${label.toLowerCase()} ${value ?? ""}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <div className="relative w-full border-b items-center flex">
            <Search className="absolute left-2 size-4 text-muted-foreground" />
            <CommandInput 
              placeholder={`Search ${label}...`} 
              className="h-10 border-0 focus:ring-0 pl-8"
            />
          </div>

          <CommandList>
            <ScrollArea className="h-72">
              <CommandEmpty>No data available</CommandEmpty>
              <CommandGroup>
                {currentItems.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.title} 
                    onSelect={() => handleSelect(item.value)}
                  >
                    {item.title}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
"use client";

import * as React from "react";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useEntityTypeStore } from "@/stores/entityTypeStore";

interface Props {
  populateBuilder: (entType: string) => void;
}

export default function EntitySearch({ populateBuilder }: Props) {
  // State quản lý UI
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  
  // State debounce để tránh gọi store quá nhiều
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  // Lấy data và action từ store
  const { searchResults, search, resetCategories } = useEntityTypeStore();

  // Logic Debounce (Thay thế useDebounce của VueUse) 
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Logic Search khi query thay đổi 
  React.useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  // Chuyển đổi searchResults (Object) sang Array để render
  const searchResultsList = React.useMemo(() => {
    return Object.entries(searchResults).map(([entType, descr]) => ({
      entType,
      descr,
    }));
  }, [searchResults]);

  // Logic thông báo trạng thái
  const searchMessage = React.useMemo(() => {
    if (query.length > 2) return "No data available";
    return "Query must be at least 3 characters";
  }, [query]);

  // Handle Click Selection 
  const handleSelect = (entType: string) => {
    resetCategories();
    populateBuilder(entType);
    setOpen(false); // Đóng dropdown sau khi chọn
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* Giả lập Input trigger giống Vue */}
        <div 
          className="relative flex grow w-full max-w-sm items-center cursor-text border rounded-md px-3 py-2 text-sm shadow-sm"
          onClick={() => setOpen(true)}
        >
          <Search className="absolute left-3 size-4 text-muted-foreground" />
          <input
            className="flex h-5 w-full bg-transparent pl-9 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Entity name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </PopoverTrigger>

      {/* Dropdown Content */}
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}> 
          <CommandInput 
             value={query}
             onValueChange={setQuery}
             className="hidden" 
          />

          <CommandList>
            <ScrollArea className="h-72"> {/* Chiều cao cố định giống h-100 trong Vue */}
              
              {/* Hiển thị Empty state */}
              {searchResultsList.length === 0 && (
                <div className="py-6 text-center text-sm" role="presentation">
                  {searchMessage}
                </div>
              )}

              {searchResultsList.length > 0 && (
                <CommandGroup>
                  {searchResultsList.map((item) => (
                    <CommandItem
                      key={item.entType}
                      value={item.entType}
                      onSelect={() => handleSelect(item.entType)}
                      className="cursor-pointer"
                    >
                      <div className="grid grid-cols-[auto,1fr] gap-2 w-full">
                        <div>{item.entType}</div>
                        <div className="font-light text-muted-foreground truncate">
                          {/* Ép kiểu descr thành string hoặc render nội dung phù hợp */}
                          {String(item.descr)}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4 opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
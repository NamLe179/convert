"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, Plus, Grid3x3, EllipsisVertical } from "lucide-react";
import { useSideStore } from "@/stores/uiStore";
import { useScenarioStore } from "@/stores/scenarioStore";

interface Props {
  onToggleVisibility: () => void;
  onCreateForceSide: () => void;
  onShowAssociations: () => void;
}

export default function SideActions({
  onToggleVisibility,
  onCreateForceSide,
  onShowAssociations,
}: Props) {
  // 1. Access Scenario Store
  const { msdl } = useScenarioStore();

  // 2. Access Side Store
  // Lấy trực tiếp state và actions đã định nghĩa trong uiStore.ts
  const { 
    hideEmptySides, 
    sortAlphabetically, 
    setHideEmptySides, 
    setSortAlphabetically 
  } = useSideStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
          <EllipsisVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Side actions</DropdownMenuLabel>
        
        {/* Create Force Side */}
        <DropdownMenuItem 
          onSelect={onCreateForceSide} 
          disabled={!msdl}
        >
          <Plus className="mr-2 size-4" />
          Create Force Side
        </DropdownMenuItem>

        {/* Show Associations */}
        <DropdownMenuItem onSelect={onShowAssociations}>
          <Grid3x3 className="mr-2 size-4" />
          Show side associations
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />

        {/* Toggle Visibility */}
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault(); 
            onToggleVisibility();
          }}
        >
          <Eye className="mr-2 size-4" />
          Toggle layer visibility
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />

        {/* Hide Empty Sides */}
        {/* Kết nối trực tiếp với setHideEmptySides từ store */}
        <DropdownMenuCheckboxItem
          checked={hideEmptySides}
          onCheckedChange={setHideEmptySides}
        >
          Hide empty sides
        </DropdownMenuCheckboxItem>

        {/* Sort Alphabetically */}
        {/* Kết nối trực tiếp với setSortAlphabetically từ store */}
        <DropdownMenuCheckboxItem
          checked={sortAlphabetically}
          onCheckedChange={setSortAlphabetically}
        >
          Sort alphabetically
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
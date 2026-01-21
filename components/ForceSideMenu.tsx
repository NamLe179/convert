"use client";

import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StandardIdentity, type ForceSide } from "@orbat-mapper/msdllib";
import { useScenarioStore } from "@/stores/scenarioStore";
import { useSelectStore } from "@/stores/selectStore";

interface Props {
  side: ForceSide;
}

export default function ForceSideActions({ side }: Props) {
  // Access Stores
  const { msdl, modifyScenario } = useScenarioStore();
  const { setPrimarySide, setSideAffiliation } = modifyScenario;
  
  const selectStore = useSelectStore();

  const handleSelectSide = () => {
    if ('activeItem' in selectStore) {
      (selectStore as any).activeItem = side; 
    } else if ('setActiveItem' in selectStore) {
      (selectStore as any).setActiveItem(side);
    }
  };

  // Logic lấy Affiliation hiện tại (tương đương phần 'get' của computed)
  const currentAffiliation = (msdl && side.getAffiliation()) || StandardIdentity.Unknown;

  // Logic xử lý thay đổi Affiliation (tương đương phần 'set' của computed)
  const handleAffiliationChange = (value: string) => {
    setSideAffiliation(side, value as StandardIdentity);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => e.stopPropagation()}
        >
          <EllipsisVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>ForceSide actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onSelect={(e) => {
          e.preventDefault(); // Ngăn menu đóng ngay lập tức nếu cần xử lý async
          handleSelectSide();
        }}>
          View details
        </DropdownMenuItem>
        
        <DropdownMenuItem onSelect={() => setPrimarySide(side)}>
          Set as primary side
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Set affiliation</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={currentAffiliation} 
              onValueChange={handleAffiliationChange}
            >
              {/* Object.entries để lặp qua Enum */}
              {Object.entries(StandardIdentity).map(([key, value]) => (
                <DropdownMenuRadioItem 
                  key={key} 
                  value={value}
                  onSelect={(e) => e.preventDefault()} // Giữ menu mở khi chọn radio nếu muốn
                >
                  {key}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
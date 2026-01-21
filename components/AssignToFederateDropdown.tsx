"use client";

import { useMemo } from "react";
import { Box, EllipsisVertical } from "lucide-react";
import { useScenarioStore } from "@/stores/scenarioStore";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  objectHandle: string;
  onAssignToFederate: (objectHandle: string, federateHandle: string) => void;
  className?: string;
}

export default function AssignToFederateDropdown({ 
  objectHandle, 
  onAssignToFederate, 
  className
}: Props) {
  // 1. Access Store
  const { msdl } = useScenarioStore();

  // 2. Derive Data
  // Lấy unit/equipment hiện tại
  const unit = msdl?.getUnitOrEquipmentById(objectHandle);
  
  // Lấy danh sách tất cả federates
  const federates = msdl?.deployment?.federates || [];

  // 3. Filter Logic
  // Lọc ra các federate mà unit này CHƯA thuộc về
  const availableFederates = useMemo(() => {
    if (!unit) return [];
    
    return federates.filter((fed) => 
      !fed.units.includes(unit.objectHandle) && 
      !fed.equipment.includes(unit.objectHandle)
    );
  }, [federates, unit]);

  // 4. Handlers
  const handleAssign = (federateHandle: string) => {
    onAssignToFederate(objectHandle, federateHandle);
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
        <DropdownMenuLabel>Assign to federate:</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableFederates.map((federate) => (
          <DropdownMenuItem
            key={federate.objectHandle}
            onSelect={() => handleAssign(federate.objectHandle)}
            disabled={!msdl}
          >
            {/* Thêm class margin để icon đẹp hơn */}
            <Box className="mr-2 h-4 w-4" /> 
            {federate.name}
          </DropdownMenuItem>
        ))}

        {/* Optional: Hiển thị nếu không còn federate nào để assign */}
        {availableFederates.length === 0 && (
          <div className="p-2 text-xs text-muted-foreground text-center">
            No other federates available
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
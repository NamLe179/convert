"use client";

import { type EquipmentItem, type Unit } from "@orbat-mapper/msdllib";
import { Focus } from "lucide-react"; 

// UI Components
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Custom Components
import MilSymbol from "@/components/MilSymbol";

// Stores
import { useSelectStore } from "@/stores/selectStore";

interface Props {
  item: Unit;
  // Thay thế emit('flyTo')
  onFlyTo: (eq: EquipmentItem) => void;
}

export default function DetailsPanelEquipmentList({ item, onFlyTo }: Props) {
  const selectStore = useSelectStore();

  const onSelectEquipment = (eq: EquipmentItem) => {
    if ('activeItem' in selectStore) {
        (selectStore as any).activeItem = eq;
    }
  };

  return (
    <div>
      <Table className="-mt-4 w-full">
        <TableBody>
          {item.equipment && item.equipment.length > 0 ? (
            item.equipment.map((eq) => (
              <TableRow key={eq.objectHandle}>
                {/* Symbol Column */}
                <TableCell className="w-5 p-0">
                  <MilSymbol sidc={eq.sidc} size={16} />
                </TableCell>
                
                {/* Link/Label Column */}
                <TableCell>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => onSelectEquipment(eq)}
                  >
                    {eq.label}
                  </Button>
                </TableCell>
                
                {/* Action Column */}
                <TableCell className="w-9">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onFlyTo(eq)}
                  >
                    <Focus className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
             // Xử lý trường hợp không có equipment nếu cần
             null 
          )}
        </TableBody>
      </Table>
      
      {/* Empty list từ code gốc */}
      <ul className="list-disc pl-4"></ul>
    </div>
  );
}
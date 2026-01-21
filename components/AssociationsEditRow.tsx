"use client";

import { useState } from "react";
import {
  type ForceSide,
  type HostilityStatusCode,
  HostilityStatusCodeItems,
} from "@orbat-mapper/msdllib";

// Components
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import EnumSelect from "@/components/EnumSelect"; 
import { useScenarioStore } from "@/stores/scenarioStore";

interface Props {
  forceSide: ForceSide;
  sides: ForceSide[];
  rowIndex: number;
  associationMap: Record<string, Record<string, HostilityStatusCode>>;
  onCancel: () => void;
  onClose: () => void;
}

export default function AssociationsEditRow({
  forceSide,
  sides,
  rowIndex,
  associationMap,
  onCancel,
  onClose,
}: Props) {
  // 1. Store Access
  const { modifyScenario } = useScenarioStore();

  // 2. Local State
  // Khởi tạo state từ props 
  const [form, setForm] = useState<Record<string, HostilityStatusCode>>({
    ...associationMap[forceSide.objectHandle],
  });

  // 3. Handlers
  const handleSave = () => {
    // Transform object về mảng update theo format store yêu cầu
    const updatedAssociations = Object.entries(form).map(
      ([affiliateHandle, relationship]) => ({
        affiliateHandle,
        relationship,
      })
    );

    modifyScenario.updateForceSideAssociation(
      forceSide.objectHandle,
      updatedAssociations
    );
    
    onClose();
  };

  const handleAssociationChange = (
    affiliateHandle: string,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [affiliateHandle]: value as HostilityStatusCode,
    }));
  };

  return (
    <>
      {/* Cột 1: Spacer (Sticky) */}
      <TableCell className="sticky left-0 z-10 bg-background/70 backdrop-blur-sm">
        {/* Empty cell */}
      </TableCell>

      {/* Cột 2: Tên Side & Actions (Sticky) */}
      <TableCell className="font-medium sticky left-10 z-10 bg-background/70 backdrop-blur-sm min-w-[200px]">
        <span className="font-bold">{forceSide.name}</span>
        <div className="mt-4 -ml-4 pr-4 flex items-center gap-2">
          <Button 
            onClick={onCancel} 
            variant="secondary" 
            size="sm"
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </TableCell>

      {/* Cột Dynamic: Các ô Dropdown tương ứng với các Side khác */}
      {sides.map((affiliate, columnIndex) => (
        <TableCell
          key={affiliate.objectHandle}
          data-column={columnIndex}
          data-row={rowIndex}
          className="bg-accent/60 min-w-[150px]"
        >
          {/* Không hiển thị dropdown nếu là chính nó */}
          {forceSide.objectHandle !== affiliate.objectHandle && (
            <div className="w-full">
              <EnumSelect
                values={HostilityStatusCodeItems}
                value={form[affiliate.objectHandle]}
                onValueChange={(val) => 
                  handleAssociationChange(affiliate.objectHandle, val)
                }
              />
            </div>
          )}
        </TableCell>
      ))}
    </>
  );
}
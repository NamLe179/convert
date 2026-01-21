"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Pencil } from "lucide-react";
import { HostilityStatusCodeItems } from "@orbat-mapper/msdllib";

// Utils & Stores
import { useScenarioStore } from "@/stores/scenarioStore";
import { useSideStore } from "@/stores/uiStore";
import { enum2Object, sortBy } from "@/lib/utils-msdl";
import { cn } from "@/lib/utils";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Custom Components
import AssociationsEditRow from "@/components/AssociationsEditRow"; 

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditAssociationsDialog({ open, onOpenChange }: Props) {
  // 1. Stores
  const { msdl } = useScenarioStore();
  const sideStore = useSideStore();

  // 2. Local State
  const [currentRow, setCurrentRow] = useState(-1);
  const [currentColumn, setCurrentColumn] = useState(-1);
  const [editRowIndex, setEditRowIndex] = useState(-1);

  // 3. Computed Data (useMemo)
  const associationMap = useMemo((): Record<string, Record<string, any>> => {
    if (!msdl) return {};
    return Object.fromEntries(
      msdl.forceSides.map((forceSide) => [
        forceSide.objectHandle,
        Object.fromEntries(forceSide.associations.map((a) => [a.affiliateHandle, a.relationship])),
      ])
    );
  }, [msdl]);

  const sides = useMemo(() => {
    if (!msdl) return [];
    const sourceSides = msdl.sides || [];
    
    if (sideStore.hideEmptySides) {
      return sortBy(
        sourceSides.filter(
          (side) => side.subordinates.length > 0 || side.equipment.length > 0
        ),
        "name"
      );
    }
    return sortBy(sourceSides, "name");
  }, [msdl, sideStore.hideEmptySides]);

  const enumLookup = useMemo(() => enum2Object(HostilityStatusCodeItems), []);

  // 4. Effects
  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setCurrentRow(-1);
      setCurrentColumn(-1);
      setEditRowIndex(-1);
    }
  }, [open]);

  // 5. Handlers
  const handlePointerOver = (event: React.PointerEvent<HTMLTableSectionElement>) => {
    const target = event.target as HTMLElement;
    // Tìm thẻ td/th gần nhất để lấy dataset 
    const cell = target.closest("td, th") as HTMLElement;
    
    if (cell) {
      const row = cell.dataset.row;
      const column = cell.dataset.column;
      
      if (editRowIndex < 0 && row !== undefined && column !== undefined) {
        setCurrentRow(+row);
        setCurrentColumn(+column);
        return;
      }
    }
    
    // Reset nếu ra ngoài vùng active hoặc đang edit
    setCurrentRow(-1);
    setCurrentColumn(-1);
  };

  const handlePointerLeave = () => {
    setCurrentRow(-1);
    setCurrentColumn(-1);
  };

  const handleEditRow = (rowIndex: number) => {
    if (editRowIndex === rowIndex) {
      setEditRowIndex(-1); // Stop editing
    } else {
      setEditRowIndex(rowIndex);
    }
  };

  // Helper cho switch store
  const toggleHideEmptySides = (checked: boolean) => {
    if ('setHideEmptySides' in sideStore) {
        (sideStore as any).setHideEmptySides(checked);
    } else {
        (sideStore as any).hideEmptySides = checked;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-auto sm:max-w-[calc(100%-8rem)] max-h-[90dvh] flex flex-col">
        <DialogHeader className="flex-none">
          <DialogTitle>Associations</DialogTitle>
          <DialogDescription>Associations between forces and sides</DialogDescription>
        </DialogHeader>

        {msdl && (
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Empty Corner */}
                  <TableHead className="sticky left-0 z-20 top-0 bg-background backdrop-blur-sm min-w-[50px]"></TableHead>
                  
                  {/* Force/Side Label Column */}
                  <TableHead className="sticky left-[50px] z-20 top-0 bg-background backdrop-blur-sm min-w-[150px]">
                    Force/Side
                  </TableHead>

                  {/* Columns Headers */}
                  {sides.map((forceSide, columnIndex) => (
                    <TableCell
                      key={forceSide.objectHandle}
                      className={cn(
                        "font-medium sticky top-0 bg-background backdrop-blur-sm whitespace-nowrap z-10",
                        currentColumn === columnIndex ? "bg-accent/60" : ""
                      )}
                      data-column={columnIndex} // Dùng columnIndex thực (0-based) cho logic hover
                    >
                      {forceSide.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody
                onPointerOver={handlePointerOver}
                onPointerLeave={handlePointerLeave}
              >
                {sides.map((forceSide, rowIndex) => (
                  <TableRow
                    key={forceSide.objectHandle}
                    data-row={rowIndex}
                    className="hover:bg-transparent" // Disable default row hover để dùng custom logic
                  >
                    {editRowIndex === rowIndex ? (
                      // Edit Mode Component
                      <AssociationsEditRow
                        forceSide={forceSide}
                        rowIndex={rowIndex}
                        associationMap={associationMap}
                        sides={sides}
                        onCancel={() => handleEditRow(-1)}
                        onClose={() => handleEditRow(-1)}
                      />
                    ) : (
                      // View Mode Cells
                      <>
                        {/* Edit Button Cell (Sticky Left 0) */}
                        <TableCell
                          className={cn(
                            "font-medium sticky left-0 z-10 bg-background/95 backdrop-blur-sm p-2 w-[50px]",
                            currentRow === rowIndex ? "bg-accent/60" : ""
                          )}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground h-8 w-8"
                            onClick={() => handleEditRow(rowIndex)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>

                        {/* Row Header (Sticky Left 50) */}
                        <TableCell
                          className={cn(
                            "font-medium sticky left-[50px] z-10 bg-background/95 backdrop-blur-sm whitespace-nowrap min-w-[150px]",
                            currentRow === rowIndex ? "bg-accent/60" : ""
                          )}
                        >
                          {forceSide.name}
                        </TableCell>

                        {/* Data Cells */}
                        {sides.map((affiliate, columnIndex) => {
                          const relationship = associationMap[forceSide.objectHandle]?.[affiliate.objectHandle];
                          const label = relationship ? enumLookup[relationship]?.label : "";
                          
                          return (
                            <TableCell
                              key={affiliate.objectHandle}
                              data-column={columnIndex}
                              data-row={rowIndex}
                              className={cn(
                                "whitespace-nowrap transition-colors",
                                (currentRow === rowIndex || currentColumn === columnIndex) 
                                  ? "bg-accent/60" 
                                  : "",
                                editRowIndex >= 0 ? "text-muted-foreground/50" : ""
                              )}
                            >
                              {label}
                            </TableCell>
                          );
                        })}
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <div className="flex items-center space-x-2">
            <Switch
              id="hide-empty"
              checked={sideStore.hideEmptySides}
              onCheckedChange={toggleHideEmptySides}
            />
            <Label htmlFor="hide-empty">Hide empty sides</Label>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
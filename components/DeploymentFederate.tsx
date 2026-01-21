"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Check, Pencil, X } from "lucide-react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  extractInstruction,
  type Instruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { Federate } from "@orbat-mapper/msdllib";

// Types
import { isUnitOrEquipmentItemDragItem } from "@/types/draggables";
import { getUnallocatedFederate } from "@/stores/selectStore";

// Stores
import { useScenarioStore } from "@/stores/scenarioStore";

// UI Components
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Custom Components
import FederateStats from "@/components/FederateStats"; 

interface Props {
  federate: Federate;
}

export default function DeploymentFederate({ federate }: Props) {
  // Stores 
  const { msdl, modifyScenario } = useScenarioStore();
  
  // State & Refs 
  const fedRef = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [instruction, setInstruction] = useState<Extract<
    Instruction,
    { type: "reorder-above" | "reorder-below" | "make-child" }
  > | null>(null);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");

  // Computed Logic 
  const isNullFederate = useMemo(
    () => federate.objectHandle === getUnallocatedFederate().objectHandle,
    [federate.objectHandle]
  );

  // Drag and Drop Effect 
  useEffect(() => {
    const element = fedRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => {
        return isUnitOrEquipmentItemDragItem(source.data);
      },
      onDrag: ({ self }) => {
        setInstruction(extractInstruction(self.data) as any);
      },
      onDragEnter: () => {
        setIsDraggedOver(true);
      },
      onDragLeave: () => {
        setIsDraggedOver(false);
        setInstruction(null);
      },
      onDrop: ({ source, location }) => {
        setIsDraggedOver(false);
        setInstruction(null);

        // Access current store state
        if (!msdl || !msdl.deployment) return;

        const shiftKeyPressed = location.current.input.shiftKey;
        const data = source.data;

        if (isUnitOrEquipmentItemDragItem(data)) {
          const itemHandle = data.item.objectHandle;
          const isUnit = msdl.getUnitById(itemHandle);
          const isEquipment = msdl.getEquipmentById(itemHandle);

          // Logic xử lý drop
          if (federate.objectHandle === getUnallocatedFederate().objectHandle) {
            // Unallocate 
            if (isUnit) {
              modifyScenario.removeUnitFromFederate(itemHandle, shiftKeyPressed);
            } else if (isEquipment) {
              modifyScenario.removeEquipmentFromFederate(itemHandle);
            } else {
              console.warn(`Could not unallocate item ${itemHandle}`);
            }
          } else {
            // Assign to federate
            if (isUnit) {
              modifyScenario.assignUnitToFederate(
                itemHandle,
                federate.objectHandle,
                shiftKeyPressed
              );
            } else if (isEquipment) {
              modifyScenario.assignEquipmentToFederate(
                itemHandle,
                federate.objectHandle
              );
            } else {
              console.warn(
                `Could not assign item ${itemHandle} to ${federate.objectHandle}`
              );
            }
          }
        }
      },
    });
  }, [federate.objectHandle, msdl, modifyScenario]); // Dependencies

  // Handlers 
  const startRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNewName(federate.name ?? "");
    setIsEditing(true);
  };

  const applyRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    modifyScenario.updateFederate(federate.objectHandle, { name: newName });
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  // Handle Enter key in Input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      modifyScenario.updateFederate(federate.objectHandle, { name: newName });
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
    e.stopPropagation(); // Ngăn space bar toggle accordion
  };

  return (
    <TooltipProvider>
      <Tooltip open={isDraggedOver}>
        <TooltipTrigger asChild>
          <AccordionItem
            value={federate.objectHandle}
            ref={fedRef}
            className={cn(
              isDraggedOver && "last:border-b-2 border-2 border-blue-500"
            )}
          >
            <AccordionTrigger className="bg-card-foreground/5 py-2 rounded-none px-4 hover:no-underline">
              <div className="flex w-full items-center justify-between">
                
                {/* View Mode */}
                {!isEditing ? (
                  <span>{federate.name}</span>
                ) : (
                  /* Edit Mode */
                  <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Input
                      type="text"
                      placeholder="Federate name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-8 w-[200px]"
                    />
                    {!isNullFederate && (
                      <>
                        <Button
                          variant="ghost"
                          className="size-8 p-0" 
                          onClick={cancelRename}
                          title="Cancel"
                        >
                          <X className="h-4 w-4" /> 
                        </Button>
                        <Button
                          variant="ghost"
                          className="size-8 p-0"
                          onClick={applyRename}
                          title="Apply"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </span>
                )}

                {/* Edit Icon Button */}
                {!isEditing && !isNullFederate && (
                  <Button
                    variant="ghost"
                    className="size-8 p-0 ml-2"
                    onClick={startRename}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-4">
              {/* Truyền prop federateHandle cho component con */}
              <FederateStats federateHandle={federate.objectHandle} />
            </AccordionContent>
          </AccordionItem>
        </TooltipTrigger>
        <TooltipContent>
          <p>Holding shift while dropping moves all subordinates too</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
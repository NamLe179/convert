"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  ChevronDown,
  TableOfContents as SelectIcon,
  GripVertical as DragIcon,
} from "lucide-react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachInstruction,
  extractInstruction,
  type Instruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";

// UI Components
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Custom Components
import ForceSideMenu from "@/components/ForceSideMenu"; 
import TreeDND from "@/components/orbat/TreeDND";

// Stores & Types
import { useLayerStore } from "@/stores/layerStore";
import { useScenarioStore } from "@/stores/scenarioStore";
import { useSelectStore } from "@/stores/selectStore";
import { useSideStore } from "@/stores/uiStore";
import { useExpandedStore } from "@/stores/expandedStore";
import { 
  getSideDragItem, 
  isOrbatItemDragItem, 
  isSideDragItem 
} from "@/types/draggables";
import type { ForceSide } from "@orbat-mapper/msdllib";

interface Props {
  sideObjectHandle: string;
}

export default function ForceSideItem({ sideObjectHandle }: Props) {
  // Refs & State 
  const dndRef = useRef<HTMLButtonElement>(null); // Trigger thường là button
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [instruction, setInstruction] = useState<Extract<
    Instruction,
    { type: "reorder-above" | "reorder-below" | "make-child" }
  > | null>(null);

  // Stores 
  const { msdl } = useScenarioStore();
  const revision = useScenarioStore((state) => state.revision);
  const selectStore = useSelectStore();
  const sideStore = useSideStore();
  const expandedStore = useExpandedStore();
  const layerStore = useLayerStore();

  // Computed (Memo) 
  const side = useMemo(() => {
    return msdl?.getForceSideById(sideObjectHandle) as ForceSide;
  }, [msdl, sideObjectHandle, revision]);

  // Handle trường hợp side chưa load
  if (!side) return null;

  // Check if this side or any of its children is selected
  const isSelected = selectStore.activeItem?.objectHandle === side.objectHandle;
  const hasSelectedChild = useMemo(() => {
    if (!selectStore.activeItem) return false;
    // Check if activeItem is a unit or equipment in this side
    const activeItemId = selectStore.activeItem.objectHandle;
    const checkInSide = (sideToCheck: ForceSide): boolean => {
      // Check units
      if (sideToCheck.subordinates.some(unit => unit.objectHandle === activeItemId)) return true;
      // Check equipment
      if (sideToCheck.equipment.some(eq => eq.objectHandle === activeItemId)) return true;
      // Check nested units recursively
      for (const unit of sideToCheck.subordinates) {
        if (unit.subordinates?.some(subUnit => subUnit.objectHandle === activeItemId)) return true;
        if (unit.equipment?.some(eq => eq.objectHandle === activeItemId)) return true;
      }
      return false;
    };
    return checkInSide(side);
  }, [selectStore.activeItem, side]);

  // Actions 
  const toggleSide = useCallback((id: string) => {
    layerStore.toggleLayer(id);
  }, [layerStore]);

  const expandItem = useCallback(() => {
    // Logic expand item trong store
    if (!expandedStore.openSideItems.includes(side.objectHandle)) {
      expandedStore.openSideItems.push(side.objectHandle); 
    }
  }, [expandedStore, side.objectHandle]);

  // Timeout Logic
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startOpenTimeout = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      expandItem();
    }, 500);
  };

  const stopOpenTimeout = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Drag and Drop Effect 
  useEffect(() => {
    const element = dndRef.current;
    if (!element) return;

    return combine(
      dropTargetForElements({
        element,
        getData: ({ input, element, source }) => {
          const data = getSideDragItem({ item: side });
          return attachInstruction(data, {
            input,
            element,
            indentPerLevel: 16,
            currentLevel: 0,
            mode: "standard",
            block: isSideDragItem(source.data)
              ? ["make-child"]
              : ["reorder-above", "reorder-below"],
          });
        },
        canDrop: ({ source }) => {
          return isOrbatItemDragItem(source.data);
        },
        onDrag: ({ self }) => {
          setInstruction(extractInstruction(self.data) as any);
        },
        onDragEnter: ({ source }) => {
          setIsDraggedOver(true);
          if (!isSideDragItem(source.data)) {
            startOpenTimeout();
          }
        },
        onDragLeave: () => {
          setIsDraggedOver(false);
          setInstruction(null);
          stopOpenTimeout();
        },
        onDrop: ({ source }) => {
          setInstruction(null);
          if (!isSideDragItem(source.data)) expandItem();
          stopOpenTimeout();
        },
      }),
      draggable({
        element,
        getInitialData: () => getSideDragItem({ item: side }),
        canDrag: () => !sideStore.sortAlphabetically,
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      })
    );
  }, [side, sideStore.sortAlphabetically, expandItem]); // Dependencies

  return (
    <AccordionItem value={side.objectHandle}>
      <AccordionTrigger
        ref={dndRef}
        className={cn(
          "py-1 rounded-none px-4 group relative hover:no-underline",
          (isSelected || hasSelectedChild) ? "bg-primary/20 hover:bg-primary/25" : "bg-card-foreground/5 hover:bg-card-foreground/10"
        )}
      >
        {/* Left Side: Drag Handle & Name */}
        <div className="flex items-center gap-2 h-9">
          {!sideStore.sortAlphabetically ? (
            <DragIcon className="size-4 group-hover:opacity-100 cursor-move -ml-2 group-focus-within:opacity-100 opacity-0 text-muted-foreground" />
          ) : (
            <span className="size-4 -ml-2" />
          )}
          
          <span className="font-medium">{side.name}</span>
          
          {side === msdl?.primarySide && (
            <Badge>Primary</Badge>
          )}
        </div>

        {/* Right Side: Actions (Custom Icon slot mockup) */}
        <div className="flex items-center gap-2 ml-auto mr-2">
          {/* Select Button - Using div instead of Button to avoid nested button */}
          <div
            className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 cursor-pointer"
            title="Show details"
            onClick={(e) => {
              e.stopPropagation();
              selectStore.setActiveItem(side);
            }}
          >
            <SelectIcon className="size-4" />
          </div>

          {/* Visibility Switch - Using custom checkbox to avoid nested buttons */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              toggleSide(side.objectHandle);
            }}
            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors"
            style={{
              backgroundColor: layerStore.layers.has(side.objectHandle) ? '#3f3f46' : '#b8b6b6'
            }}
            title="Toggle visibility"
          >
            <span 
              className="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform"
              style={{
                transform: layerStore.layers.has(side.objectHandle) ? 'translateX(18px)' : 'translateX(2px)'
              }}
            />
          </div>

          {/* Context Menu */}
          <div onClick={(e) => e.stopPropagation()}>
            <ForceSideMenu side={side} />
          </div>
        </div>

        {/* Drag Instruction Overlay */}
        {instruction && (
          <div
            className={cn(
              "absolute h-full inset-0 w-full border-blue-500 pointer-events-none",
              instruction.type === "reorder-below" && "border-b-2",
              instruction.type === "reorder-above" && "border-t-2",
              instruction.type === "make-child" && "border-2 rounded"
            )}
          />
        )}
      </AccordionTrigger>

      <AccordionContent>
        {side.forces.length > 0 ? (
          side.forces.map((force) => (
            <div key={force.objectHandle} className="my-2">
              <div className="flex items-center justify-between pr-4">
                <h4 className="text-sm ml-4">{force.name}</h4>
                <div className="gap-1 flex items-center">
                  {force.militaryService && (
                    <Badge variant="secondary">{force.militaryService}</Badge>
                  )}
                  {force.countryCode && (
                    <Badge variant="secondary">{force.countryCode}</Badge>
                  )}
                </div>
              </div>
              {/* Truyền props cho component con */}
              <TreeDND sideObjectHandle={side.objectHandle} />
            </div>
          ))
        ) : (
          <TreeDND sideObjectHandle={side.objectHandle} />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachInstruction,
  extractInstruction,
  type Instruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { ChevronDown, ChevronsRight } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; 

import {
  getEquipmentItemDragItem,
  getUnitDragItem,
  isEquipmentItemDragItem,
  isUnitDragItem,
  isUnitOrEquipmentItemDragItem,
} from "@/types/draggables";
import type { OrbatTreeItem } from "@/components/orbat/types";
import { useSelectStore, getUnallocatedFederate } from "@/stores/selectStore";
import { useScenarioStore } from "@/stores/scenarioStore";
import MilSymbol from "@/components/MilSymbol"; 

type FlattenedItem<T> = {
  item: T;
  level: number;
  index: number;
  hasChildren: boolean;
  childrenCount?: number;
  parentItem?: any;
  value: T; // Trong code Vue có truy cập .value
  _id: string;
};

interface Props {
  item: FlattenedItem<OrbatTreeItem>;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function TreeItemRow({ item, isExpanded, onToggle }: Props) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  // Dùng ref cho initialExpanded để tránh stale closure trong callback
  const isInitialExpanded = useRef(false); 
  
  const [instruction, setInstruction] = useState<Extract<
    Instruction,
    { type: "reorder-above" | "reorder-below" | "make-child" }
  > | null>(null);

  const { msdl } = useScenarioStore();
  const revision = useScenarioStore((state) => state.revision);
  const selectStore = useSelectStore();

  // Tính toán logic
  const mode = useMemo(() => {
    if (item.hasChildren) return "expanded";
    // Logic kiểm tra last-in-group phụ thuộc vào data structure
    if (item.parentItem && item.index + 1 === item.parentItem.childrenCount) return "last-in-group";
    return "standard";
  }, [item]);

  const federate = useMemo(() => {
    return msdl?.getFederateOfUnitOrEquipment(item._id) || getUnallocatedFederate();
  }, [msdl, item._id, revision]);

  // Xử lý timeout
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startOpenTimeout = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (!isExpanded) {
        onToggle();
      }
    }, 500);
  }, [isExpanded, onToggle, clearTimer]);

  const closeItem = useCallback(() => {
    if (isExpanded) onToggle();
  }, [isExpanded, onToggle]);

  const expandItem = useCallback(() => {
    if (!isExpanded) onToggle();
  }, [isExpanded, onToggle]);

  // Kéo thả
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const getDragData = () => 
      item.value.itemType === "unit"
        ? getUnitDragItem({ item: item.value })
        : getEquipmentItemDragItem({ item: item.value });

    return combine(
      draggable({
        element,
        getInitialData: getDragData,
        onDragStart: () => {
          setIsDragging(true);
          isInitialExpanded.current = isExpanded;
          closeItem();
        },
        onDrop: () => {
          setIsDragging(false);
          if (isInitialExpanded.current) expandItem();
        },
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            getOffset: pointerOutsideOfPreview({ x: "16px", y: "8px" }),
            render: ({ container }) => {
              // React workaround: Clone node hiện tại để làm preview
              const clone = element.cloneNode(true) as HTMLElement;
              clone.style.backgroundColor = "white";
              clone.style.padding = "4px";
              clone.style.borderRadius = "4px";
              clone.style.opacity = "1";
              clone.style.width = "auto";
              container.appendChild(clone);
              return () => {
              };
            },
            nativeSetDragImage,
          });
        },
      }),

      dropTargetForElements({
        element,
        getData: ({ input, element, source }) => {
          const isUnit = item.value.itemType === "unit";
          const data = getDragData();

          return attachInstruction(data, {
            input,
            element,
            indentPerLevel: 16,
            currentLevel: item.level,
            mode: mode,
            block: isEquipmentItemDragItem(source.data)
              ? isUnit
                ? ["reorder-below", "reorder-above"]
                : ["make-child"]
              : [],
          });
        },
        canDrop: ({ source }) => {
          if (isUnitOrEquipmentItemDragItem(source.data)) {
            const { item: sourceItem } = source.data;
            if (sourceItem.objectHandle === item._id) {
              return false;
            }
            if (isUnitDragItem(source.data) && item.value.itemType === "equipment") {
              return false;
            }
            if (isEquipmentItemDragItem(source.data) && item.value.itemType === "equipment") {
              return false;
            }
            return true;
          }
          return false;
        },
        onDrag: ({ self }) => {
          setInstruction(extractInstruction(self.data) as any);
        },
        onDragEnter: ({ source }) => {
          if (
            isUnitOrEquipmentItemDragItem(source.data) &&
            source.data.item.objectHandle !== item._id
          ) {
            setIsDraggedOver(true);
            // Kiểm tra instruction trước khi start timeout để tránh mở nhầm
            startOpenTimeout();
          }
        },
        onDragLeave: () => {
          setIsDraggedOver(false);
          setInstruction(null);
          clearTimer();
        },
        onDrop: () => {
          setIsDraggedOver(false);
          setInstruction(null);
          clearTimer();
        },
        getIsSticky: () => true,
      }),

      monitorForElements({
        canMonitor: ({ source }) => {
          return source.data.id !== item._id;
        },
      })
    );
  }, [item, mode, isExpanded, closeItem, expandItem, startOpenTimeout, clearTimer]);

  // Handlers
  const handleSelect = (e: React.MouseEvent) => {
    // Ngăn chặn việc click vào expand button cũng kích hoạt select nếu cần
    if (e.defaultPrevented) return;
    selectStore.setActiveItem(msdl?.getUnitOrEquipmentById(item._id) ?? null);
  };

  const handleOpenFederate = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectStore.setActiveFederate(federate);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  // Check if this item is selected
  const isSelected = selectStore.activeItem?.objectHandle === item._id;

  return (
    <div
      ref={elementRef}
      id={`oi-${item._id}`}
      className={cn(
        "relative w-full border-none flex items-center py-1 cursor-pointer",
        isDragging && "opacity-50",
        isSelected ? "bg-primary/15" : "hover:bg-slate-100" // Only apply hover if not selected
      )}
      style={{ paddingLeft: `${item.level * 16}px` }} // Xử lý indentation
      onClick={handleSelect}
    >
      {/* Toggle Button */}
      {item.hasChildren ? (
        <button
          tabIndex={-1}
          type="button"
          onClick={toggleExpand}
          className="pr-1 focus:outline-none"
        >
          <ChevronDown
            className={cn(
              "size-5 transition-transform duration-200",
              !isExpanded && "-rotate-90"
            )}
          />
        </button>
      ) : (
        <span className="size-5 mr-1 block" />
      )}

      {/* Icon & Label */}
      <MilSymbol sidc={item.value.sidc} size={16} />
      
      <div
        className={cn(
          "pl-2 text-sm",
          selectStore.activeItem?.objectHandle === item._id && "font-bold"
        )}
      >
        {item.value.label}
      </div>

      {/* Drag Instruction Indicator */}
      {instruction && (
        <div
          className={cn(
            "absolute pointer-events-none top-0 border-blue-500 z-10",
            instruction.type === "reorder-below" && "border-b-2 bottom-0 top-auto h-0",
            instruction.type === "reorder-above" && "border-t-2 h-0",
            instruction.type === "make-child" && "border-2 rounded h-full"
          )}
          style={{
             // Điều chỉnh style vị trí dựa trên indent
             left: `${instruction.currentLevel * instruction.indentPerLevel - 16}px`,
             width: `calc(100% - ${instruction.currentLevel * instruction.indentPerLevel}px)`,
             height: instruction.type === 'make-child' ? '100%' : '0px'
          }}
        />
      )}

      {/* Badge */}
      <div className="ml-auto pr-2">
        <Badge onClick={handleOpenFederate} variant="secondary">
          {federate.name}
        </Badge>
      </div>
    </div>
  );
}
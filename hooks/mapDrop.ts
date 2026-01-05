"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { Position } from "geojson";
import { useScenarioStore } from "@/stores/scenarioStore";
import { formatDecimalDegrees } from "@/lib/utils-msdl";
import {
  getPositionDropItem,
  isEquipmentItemDragItem,
  isPositionDropItem,
  isUnitDragItem,
} from "@/types/draggables";

/**
 * React hook version of useMapDrop
 */
export function useMapDrop(map: MapLibreMap) {
  const {
    modifyScenario: { updateItemLocation },
  } = useScenarioStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dropPosition, setDropPosition] = useState<Position>([0, 0]);

  const cleanupRef = useRef<() => void>(() => {});
  const clientRectRef = useRef<DOMRect | null>(null);

  /**
   * formattedPosition (computed → useMemo)
   */
  const formattedPosition = useMemo(() => {
    return isDragging ? formatDecimalDegrees(dropPosition) : "";
  }, [isDragging, dropPosition]);

  /**
   * Mount / Unmount
   */
  useEffect(() => {
    if (!map) return;

    const mlMap = map;
    clientRectRef.current = mlMap.getContainer().getBoundingClientRect();

    cleanupRef.current = dropTargetForElements({
      element: mlMap.getContainer(),

      canDrop: ({ source }) =>
        isUnitDragItem(source.data) ||
        isEquipmentItemDragItem(source.data),

      getData: ({ input }) => {
        const rect = clientRectRef.current!;
        const lngLatObj = mlMap.unproject([
          input.pageX - rect.x,
          input.pageY - rect.y,
        ]);

        const position: Position = [lngLatObj.lng, lngLatObj.lat];

        return getPositionDropItem({ position });
      },

      onDragEnter: () => {
        setIsDragging(true);
      },

      onDragLeave: () => {
        setIsDragging(false);
      },

      onDrag: ({ self }) => {
        setDropPosition(self.data.position as Position);
      },

      onDrop: ({ source, self }) => {
        setIsDragging(false);

        const dragData = source.data;

        if (
          !isUnitDragItem(dragData) &&
          !isEquipmentItemDragItem(dragData)
        ) {
          return;
        }

        if (isPositionDropItem(self.data)) {
          updateItemLocation(
            dragData.item.objectHandle,
            self.data.position,
          );
        }
      },
    });

    return () => {
      cleanupRef.current?.();
    };
  }, [map, updateItemLocation]);

  return {
    isDragging,
    dropPosition,
    formattedPosition,
  };
}

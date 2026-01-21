"use client";

import type { Map as MlMap } from "maplibre-gl";
import { type EquipmentItem, ForceSide, type Unit } from "@orbat-mapper/msdllib";

// Components
import DetailsPanel from "@/components/DetailsPanel"; 
import DeploymentPanel from "@/components/DeploymentPanel";

// Stores & Logic
import { useSelectStore } from "@/stores/selectStore";
import { flyToItem } from "@/hooks/mapActions"; 

interface Props {
  mlMap?: MlMap;
}

export default function RightPanel({ mlMap }: Props) {
  // 1. Get state from store using selectors
  const activeItem = useSelectStore((state) => state.activeItem);
  const activeFederate = useSelectStore((state) => state.activeFederate);

  // 2. Handlers
  const handleFlyTo = (item: EquipmentItem | Unit | ForceSide) => {
    if (mlMap) {
      flyToItem(item, mlMap);
    }
  };

  return (
    <>
      {/* Details Panel: Hiển thị khi có activeItem và map instance */}
      {activeItem && mlMap && (
        <DetailsPanel
          item={activeItem}
          className="pointer-events-auto absolute right-2 top-[150px] z-50"
          onFlyTo={handleFlyTo}
          mlMap={mlMap}
        />
      )}

      {/* Deployment Panel: Hiển thị khi có activeFederate */}
      {activeFederate && (
        <DeploymentPanel
          federate={activeFederate}
          className="pointer-events-auto absolute right-2 top-[150px] z-50"
        />
      )}
    </>
  );
}
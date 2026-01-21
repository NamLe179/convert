"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import {
  type EquipmentItem,
  type Unit,
  type DispositionBase,
  type DispositionType,
} from "@orbat-mapper/msdllib";

// Components
import { Button } from "@/components/ui/button";
import DispositionEditForm from "@/components/DispositionEditForm"; 
import DescriptionItem from "@/components/DescriptionItem";
import DescriptionList from "@/components/DescriptionList"; 

// Stores & Utils
import { useScenarioStore } from "@/stores/scenarioStore";
import { formatNumber } from "@/lib/utils";
import { getElevation, getLatitude, getLongitude } from "@/lib/geoConvert";

interface Props {
  item: Unit | EquipmentItem;
}

export default function DetailsPanelDisposition({ item }: Props) {
  // 1. State
  const [showEditForm, setShowEditForm] = useState(false);

  // 2. Store Access
  const { msdl, modifyScenario } = useScenarioStore();
  const revision = useScenarioStore((state) => state.revision);

  // 3. Derived State (Reactive)
  // Lấy unit/equipment mới nhất từ store -> lấy disposition
  const currentItem = msdl?.getUnitOrEquipmentById(item.objectHandle);
  const disposition = (currentItem?.disposition as DispositionBase) ?? null;

  // 4. Handlers
  const handleUpdate = (data: DispositionType) => {
    setShowEditForm(false);
    modifyScenario.updateItemDisposition(item.objectHandle, data);
  };

  // Nếu không có dữ liệu disposition, có thể return null hoặc hiển thị thông báo
  if (!disposition) return null;

  return (
    <>
      <div className="flex items-center justify-between mt-1">
        <h4 className="text-sm font-bold">Disposition</h4>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEditForm(!showEditForm)}
            disabled={showEditForm}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showEditForm ? (
        <DispositionEditForm
          disposition={disposition}
          onCancel={() => setShowEditForm(false)}
          onUpdate={handleUpdate}
        />
      ) : (
        <DescriptionList>
          <DescriptionItem label="Lat / Lon">
            {formatNumber(getLatitude(disposition.location), {
              units: "°",
              maxDecimals: 8,
            })}{" "}
            /{" "}
            {formatNumber(getLongitude(disposition.location), {
              units: "°",
              maxDecimals: 8,
            })}
          </DescriptionItem>

          <DescriptionItem label="Elevation">
            {formatNumber(getElevation(disposition.location), { units: " m" })}
          </DescriptionItem>

          <DescriptionItem label="Direction of Movement">
            {formatNumber(disposition.directionOfMovement, { units: "°" })}
          </DescriptionItem>

          <DescriptionItem label="Speed">
            {formatNumber(disposition.speed, { units: " m/s" })}
          </DescriptionItem>
        </DescriptionList>
      )}
    </>
  );
}
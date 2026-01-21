"use client";

import { useScenarioStore } from "@/stores/scenarioStore";
import type { EquipmentItem } from "@orbat-mapper/msdllib";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

import EntityTypePanel from "@/components/EntityTypePanel";

interface Props {
  equipment: EquipmentItem;
}

export default function EquipmentModelPanel({ equipment }: Props) {
  // Access Store
  const { msdl, modifyScenario } = useScenarioStore();

  // 1. Reactive Data Access
  // Lấy equipment mới nhất từ store dựa trên ID để đảm bảo reactivity
  const currentEquipment = msdl?.getEquipmentById(equipment?.objectHandle);
  const equipmentModel = currentEquipment?.model ?? null;

  // 2. Handlers
  const handleCreateModel = () => {
    modifyScenario.updateItemModel(equipment.objectHandle, { entityType: "0.0.0.0.0.0.0" });
  };

  const handleUpdateModel = (newEntityType: string) => {
    modifyScenario.updateItemModel(equipment.objectHandle, { entityType: newEntityType });
  };

  // 3. Render Logic

  // Trường hợp 1: Đã có Model và EntityType -> Hiển thị Panel chỉnh sửa
  if (equipmentModel?.entityType) {
    return (
      <EntityTypePanel
        value={equipmentModel.entityType}
        onChange={handleUpdateModel}
      />
    );
  }

  // Trường hợp 2: Có Model nhưng chưa có EntityType (theo logic code cũ)
  if (equipmentModel) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-2">
        <h4 className="text-sm font-bold my-2">No entity type provided</h4>
        <Button variant="outline" onClick={handleCreateModel}>
          Create model <Pencil className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Trường hợp 3: Chưa có Model (Null)
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-2">
      <h4 className="text-sm font-bold my-2">No equipment model provided</h4>
      <Button variant="outline" onClick={handleCreateModel}>
        Create model <Pencil className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
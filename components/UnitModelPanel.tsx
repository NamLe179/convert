"use client";

import { useScenarioStore } from "@/stores/scenarioStore";
import type { Unit } from "@orbat-mapper/msdllib";
import { Button } from "@/components/ui/button";

import EntityTypePanel from "@/components/EntityTypePanel";

interface Props {
  unit: Unit;
}

export default function UnitModelPanel({ unit }: Props) {
  // Access Store
  const { msdl, modifyScenario } = useScenarioStore();

  // Logic: Lấy Unit mới nhất từ store để đảm bảo tính reactive
  // Nếu chỉ dùng props.unit, component có thể không update khi store thay đổi
  const currentUnit = msdl?.getUnitById(unit.objectHandle);
  const unitModel = currentUnit?.model ?? null;

  // Handlers
  const handleCreateUnitModel = () => {
    modifyScenario.updateItemModel(unit.objectHandle, { entityType: "0.0.0.0.0.0.0" });
  };

  const handleUpdateUnitModel = (newEntityType: string) => {
    modifyScenario.updateItemModel(unit.objectHandle, { entityType: newEntityType });
  };

  // Render logic
  if (unitModel) {
    return (
      <div>
        <EntityTypePanel
          value={unitModel.entityType}
          onChange={handleUpdateUnitModel}
        />
      </div>
    );
  }

  // Empty State
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-4">
      <h4 className="text-sm font-bold text-muted-foreground">
        No unit model provided
      </h4>
      <Button variant="outline" onClick={handleCreateUnitModel}>
        Create model
      </Button>
    </div>
  );
}